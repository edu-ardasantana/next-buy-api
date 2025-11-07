import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pagamento, StatusPagamento } from './pagamento.entity';
import { Pedido, PedidoStatus } from '../pedidos/pedido.entity';
import { Produto } from '../produtos/produto.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreatePagamentoDto } from './dtos/create-pagamento.dto';

@Injectable()
export class PagamentosService {

  constructor(
    @InjectRepository(Pagamento) public repo: Repository<Pagamento>,
    @InjectRepository(Pedido) private pedidoRepo: Repository<Pedido>,
    @InjectDataSource() private dataSource: DataSource,
  ){}

  async create(dto: CreatePagamentoDto){

    const pedido = await this.pedidoRepo.findOne({ where: { id: dto.pedidoId }, relations: ['itens','itens.produto'] });

    if(!pedido) throw new NotFoundException('Pedido não encontrado');

    if(pedido.status !== PedidoStatus.AGUARDANDO_PAGAMENTO && pedido.status !== PedidoStatus.ABERTO){
      throw new BadRequestException('Pagamento só pode ser criado para pedido aguardando pagamento ou aberto');
    }

    const exists = await this.repo.findOne({ where: { pedido: { id: pedido.id }, status: StatusPagamento.PENDENTE } });

    if(exists) throw new ConflictException('Já existe um pagamento pendente para esse pedido');

    // Aceita tanto 'metodo' quanto 'metodoPagamento' para compatibilidade
    const metodo = dto.metodoPagamento || dto.metodo;

    const p = this.repo.create({
      metodo: metodo,
      valor: dto.valor || pedido.total,
    });
    p.pedido = pedido;
    p.status = StatusPagamento.PENDENTE;
    p.valor = pedido.total;
    return this.repo.save(p);
  }

  async markPaid(id: string){
    const payment = await this.repo.findOne({ where: { id }, relations: ['pedido','pedido.itens','pedido.itens.produto'] });

    if(!payment) throw new NotFoundException('Pagamento não encontrado');
    
    if(payment.status === StatusPagamento.PAGO) throw new BadRequestException('Pagamento já está pago');

    return await this.dataSource.transaction(async manager => {

      const pedido = await manager.getRepository(Pedido).findOne({ where: { id: payment.pedido.id }, relations: ['itens','itens.produto'] });

      if(!pedido) throw new NotFoundException('Pedido não encontrado');

      for(const item of pedido.itens){
        if(item.produto.estoque < item.quantidade){
          throw new BadRequestException(`Estoque insuficiente para produto ${item.produto.nome}`);
        }
      }

      for(const item of pedido.itens){
        const prodRepo = manager.getRepository(Produto);
        const prod = await prodRepo.findOne({ where: { id: item.produto.id } });

        if(!prod) throw new NotFoundException(`Produto não encontrado`);
        prod.estoque = prod.estoque - item.quantidade;
        await prodRepo.save(prod);
      }

      payment.status = StatusPagamento.PAGO;
      payment.data = new Date();
      await manager.getRepository(Pagamento).save(payment);
      pedido.status = PedidoStatus.PAGO;
      await manager.getRepository(Pedido).save(pedido);
      return payment;
    });
  }

  async cancel(id: string){
    const payment = await this.repo.findOne({ where: { id }, relations: ['pedido'] });

    if(!payment) throw new NotFoundException('Pagamento não encontrado');

    if(payment.status === StatusPagamento.CANCELADO) throw new BadRequestException('Pagamento já cancelado');
    payment.status = StatusPagamento.CANCELADO;
    await this.repo.save(payment);

    if(payment.pedido && payment.pedido.status === PedidoStatus.AGUARDANDO_PAGAMENTO){
      payment.pedido.status = PedidoStatus.ABERTO;
      await this.pedidoRepo.save(payment.pedido);
    }
    return payment;
  }
}
