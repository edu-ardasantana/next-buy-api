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

  async create(dto: CreatePedidoDto){
    const pedido = this.repo.create({
      clienteId: dto.clienteId,
      status: PedidoStatus.CRIADO,
    } as any);
    const saved = await this.repo.save(pedido);
    return saved;
  }


  async liberarEstoque(pedidoId: string) {
    const pedido = await this.findOne(pedidoId);
    
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }
    
    for (const item of pedido.itens) {
      const produto = await this.produtoRepo.findOne({ where: { id: item.produto.id } });
      
      if (produto && produto.estoqueReservado >= item.quantidade) {
        produto.estoqueReservado -= item.quantidade;
        await this.produtoRepo.save(produto);
      }
    }
  }

  async debitarEstoque(pedidoId: string) {
    const pedido = await this.findOne(pedidoId);
    
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }
    
    for (const item of pedido.itens) {
      const produto = await this.produtoRepo.findOne({ where: { id: item.produto.id } });
      
      if (produto) {
        produto.estoque -= item.quantidade;
        produto.estoqueReservado -= item.quantidade;
        await this.produtoRepo.save(produto);
      }
    }
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
    if(pedido.status === PedidoStatus.CANCELADO) throw new ConflictException('Pedido cancelado não pode ser alterado');

    const produto = await this.produtosSvc.findOne(produtoId);

    if(!produto) throw new NotFoundException('Produto não encontrado');

    if(!produto.ativo) throw new BadRequestException('Produto inativo não pode ser adicionado');

    const estoqueDisponivel = produto.estoque - produto.estoqueReservado;

    const itemExistente = await this.itemRepo.findOne({
      where: { 
        pedido: { id: pedidoId },
        produto: { id: produtoId }
      }
    });

    if (itemExistente) {
      const quantidadeAdicional = quantidade;
      const novaQuantidade = itemExistente.quantidade + quantidadeAdicional;
      
      if(estoqueDisponivel < quantidadeAdicional) {
        throw new BadRequestException(`Estoque insuficiente. Disponível: ${estoqueDisponivel}, Solicitado: ${quantidadeAdicional}`);
      }

      itemExistente.quantidade = novaQuantidade;
      itemExistente.subtotal = produto.preco * novaQuantidade;
      
      await this.itemRepo.save(itemExistente);
      
      produto.estoqueReservado += quantidadeAdicional;
      await this.produtoRepo.save(produto);
      
      await this.recalculate(pedidoId);
      
      return {
        message: 'Quantidade atualizada no item existente',
        item: itemExistente
      };
    } else {
      if(estoqueDisponivel < quantidade) {
        throw new BadRequestException(`Estoque insuficiente. Disponível: ${estoqueDisponivel}`);
      }

      const item = this.itemRepo.create({
        pedido,
        produto,
        precoUnitario: produto.preco,
        quantidade,
        subtotal: produto.preco * quantidade,
      } as any);
      
      await this.itemRepo.save(item);
      
      produto.estoqueReservado += quantidade;
      await this.produtoRepo.save(produto);
      
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
    pedido.frete = this.calcularFrete(subtotal);
    pedido.total = subtotal + pedido.frete;
    pedido.quantidadeTotal = quantidadeTotal;

    return this.repo.save(pedido);
  }

  private calcularFrete(subtotal: number): number {
    if (subtotal >= 200) {
      return 0;
    }
    
    if (subtotal <= 100) {
      return 15;
    }
    
    return 10;
  }

  async update(id: string, dto: UpdatePedidoDto){
    const p = await this.findOne(id);

    if(!p) throw new NotFoundException('Pedido não encontrado');

    if(p.status === PedidoStatus.PAGO) throw new ConflictException('Pedido pago não pode ser alterado');
    if(p.status === PedidoStatus.CANCELADO) throw new ConflictException('Pedido cancelado não pode ser alterado');

    Object.assign(p,dto);

    return this.repo.save(p);
  }

  async removeItem(pedidoId: string, itemId: string){
    const pedido = await this.findOne(pedidoId);

    if(!pedido) throw new NotFoundException('Pedido não encontrado');

    if(pedido.status === PedidoStatus.PAGO) {
      throw new ConflictException('Não é possível remover item de pedido já pago');
    }
    
    if(pedido.status === PedidoStatus.CANCELADO) {
      throw new ConflictException('Não é possível remover item de pedido cancelado');
    }

    const item = await this.itemRepo.findOne({ 
      where: { id: itemId },
      relations: ['produto']
    });

    if(!item) throw new NotFoundException('Item não encontrado');
    
    const produto = await this.produtoRepo.findOne({ where: { id: item.produto.id } });
    if (produto && produto.estoqueReservado >= item.quantidade) {
      produto.estoqueReservado -= item.quantidade;
      await this.produtoRepo.save(produto);
    }

    await this.itemRepo.delete(itemId);
    await this.recalculate(pedidoId);

    return {
      message: 'Item removido com sucesso',
      deleted: true
    };
  }

  async remove(id: string){
    const pedido = await this.findOne(id);

    if(!pedido) throw new NotFoundException('Pedido não encontrado');

    if(pedido.status === PedidoStatus.PAGO) throw new ConflictException('Pedido pago não pode ser removido');
    if(pedido.status === PedidoStatus.CANCELADO) throw new ConflictException('Pedido cancelado não pode ser removido');

    await this.liberarEstoque(id);
    
    await this.repo.delete(id);
    
    return { deleted: true };
  }
}
