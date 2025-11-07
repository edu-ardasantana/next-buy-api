import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pedido, PedidoStatus } from './pedido.entity';
import { ItemPedido } from './item-pedido.entity';
import { Pagamento, StatusPagamento } from '../pagamentos/pagamento.entity';
import { Produto } from '../produtos/produto.entity';
import { ProdutosService } from '../produtos/produtos.service';
import { CreatePedidoDto } from './dtos/create-pedido.dto';
import { UpdatePedidoDto } from './dtos/update-pedido.dto';

@Injectable()
export class PedidosService {

  constructor(
    @InjectRepository(Pedido) private repo: Repository<Pedido>,
    @InjectRepository(ItemPedido) private itemRepo: Repository<ItemPedido>,
    @InjectRepository(Pagamento) private pagamentoRepo: Repository<Pagamento>,
    @InjectRepository(Produto) private produtoRepo: Repository<Produto>,
    @InjectDataSource() private dataSource: DataSource,
    private produtosSvc: ProdutosService,
  ){}

  create(dto: CreatePedidoDto){
    const pedido = this.repo.create(dto);
    return this.repo.save(pedido);
  }

  findAll(filters?: { clienteId?: string, status?: string }){ 
    const query = this.repo.createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.itens', 'itens')
      .leftJoinAndSelect('pedido.cliente', 'cliente');

    if (filters?.clienteId) {
      query.andWhere('cliente.id = :clienteId', { clienteId: filters.clienteId });
    }

    if (filters?.status) {
      query.andWhere('pedido.status = :status', { status: filters.status });
    }

    query.orderBy('pedido.createdAt', 'DESC');

    return query.getMany();
  }

  findOne(id: string){ 
    return this.repo.findOne({ where: { id }, relations: ['itens','itens.produto','cliente'] }); 
  }

  async addItem(pedidoId: string, produtoId: string, quantidade: number){
    const pedido = await this.findOne(pedidoId);

    if(!pedido) throw new NotFoundException('Pedido não encontrado');

    if(pedido.status === PedidoStatus.PAGO) throw new ConflictException('Pedido já pago e não pode ser alterado');

    const produto = await this.produtosSvc.findOne(produtoId);

    if(!produto) throw new NotFoundException('Produto não encontrado');

    if(!produto.ativo) throw new BadRequestException('Produto inativo não pode ser adicionado');

    // Verificar se produto já existe no pedido
    const itemExistente = await this.itemRepo.findOne({
      where: { 
        pedido: { id: pedidoId },
        produto: { id: produtoId }
      }
    });

    if (itemExistente) {
      // Atualizar quantidade do item existente
      const novaQuantidade = itemExistente.quantidade + quantidade;
      
      if(produto.estoque < novaQuantidade) {
        throw new BadRequestException(`Estoque insuficiente. Disponível: ${produto.estoque}, Solicitado: ${novaQuantidade}`);
      }

      itemExistente.quantidade = novaQuantidade;
      itemExistente.subtotal = produto.preco * novaQuantidade;
      
      await this.itemRepo.save(itemExistente);
      await this.recalculate(pedidoId);
      
      return {
        message: 'Quantidade atualizada no item existente',
        item: itemExistente
      };
    } else {
      // Criar novo item
      if(produto.estoque < quantidade) throw new BadRequestException('Estoque insuficiente');

      const item = this.itemRepo.create({
        pedido,
        produto,
        precoUnitario: produto.preco,
        quantidade,
        subtotal: produto.preco * quantidade,
      } as any);
      
      await this.itemRepo.save(item);
      await this.recalculate(pedidoId);

      return {
        message: 'Novo item adicionado ao pedido',
        item: item
      };
    }
  }

  async recalculate(pedidoId: string){
    const pedido = await this.findOne(pedidoId);

    if(!pedido) throw new NotFoundException('Pedido não encontrado');

    const subtotal = pedido.itens.reduce((s,i)=> s + +i.subtotal, 0);
    const quantidadeTotal = pedido.itens.reduce((s,i)=> s + +i.quantidade, 0);

    pedido.subtotal = subtotal;
    pedido.total = subtotal;
    pedido.quantidadeTotal = quantidadeTotal;

    return this.repo.save(pedido);
  }

  async update(id: string, dto: UpdatePedidoDto){
    const p = await this.findOne(id);

    if(!p) throw new NotFoundException('Pedido não encontrado');

    if(p.status === PedidoStatus.PAGO) throw new ConflictException('Pedido pago não pode ser alterado');

    Object.assign(p,dto);

    return this.repo.save(p);
  }

  async removeItem(pedidoId: string, itemId: string){
    const pedido = await this.findOne(pedidoId);

    if(!pedido) throw new NotFoundException('Pedido não encontrado');

    if(pedido.status === PedidoStatus.PAGO) {
      throw new ConflictException('Não é possível remover item de pedido já pago');
    }

    const item = await this.itemRepo.findOne({ where: { id: itemId } });

    if(!item) throw new NotFoundException('Item não encontrado');

    await this.itemRepo.delete(itemId);
    await this.recalculate(pedidoId);

    return {
      message: 'Item removido com sucesso',
      deleted: true
    };
  }

  async remove(id: string){
    const p = await this.findOne(id);

    if(!p) throw new NotFoundException('Pedido não encontrado');

    if(p.status === PedidoStatus.PAGO) throw new ConflictException('Pedido pago não pode ser removido');

    await this.repo.delete(id);
    
    return { deleted: true };
  }

  async finalizarPedido(pedidoId: string, metodoPagamento: string) {
    return await this.dataSource.transaction(async manager => {
      // Buscar pedido
      const pedido = await manager.getRepository(Pedido).findOne({
        where: { id: pedidoId },
        relations: ['itens', 'itens.produto', 'cliente']
      });

      if (!pedido) throw new NotFoundException('Pedido não encontrado');

      if (pedido.status === PedidoStatus.PAGO) {
        throw new ConflictException('Pedido já está pago');
      }

      if (!pedido.itens || pedido.itens.length === 0) {
        throw new BadRequestException('Pedido está vazio');
      }

      // Buscar pagamento pendente
      let pagamento = await manager.getRepository(Pagamento).findOne({
        where: { pedido: { id: pedidoId } }
      });

      // Verificar estoque
      for (const item of pedido.itens) {
        if (item.produto.estoque < item.quantidade) {
          throw new BadRequestException(`Estoque insuficiente para produto ${item.produto.nome}`);
        }
      }

      if (pagamento) {
        // Atualizar pagamento existente para PAGO
        pagamento.status = StatusPagamento.PAGO;
        pagamento.metodo = metodoPagamento as any;
        pagamento.data = new Date();
        await manager.getRepository(Pagamento).save(pagamento);
      } else {
        // Criar novo pagamento se não existir
        pagamento = manager.getRepository(Pagamento).create({
          pedido: pedido,
          metodo: metodoPagamento as any,
          status: StatusPagamento.PAGO,
          valor: pedido.total,
          data: new Date()
        });
        await manager.getRepository(Pagamento).save(pagamento);
      }

      // Reduzir estoque
      for (const item of pedido.itens) {
        const produto = await manager.getRepository(Produto).findOne({ 
          where: { id: item.produto.id } 
        });
        
        if (produto) {
          produto.estoque = produto.estoque - item.quantidade;
          await manager.getRepository(Produto).save(produto);
        }
      }

      // Marcar pedido como pago
      pedido.status = PedidoStatus.PAGO;
      await manager.getRepository(Pedido).save(pedido);

      return {
        success: true,
        message: 'Pedido finalizado com sucesso!',
        pedido: pedido,
        pagamento: pagamento,
        timestamp: new Date().toISOString()
      };
    });
  }
}
