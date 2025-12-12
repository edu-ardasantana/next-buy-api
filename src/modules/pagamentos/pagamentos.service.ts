import { Injectable, NotFoundException, BadRequestException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pagamento, StatusPagamento } from './pagamento.entity';
import { Pedido, PedidoStatus } from '../pedidos/pedido.entity';
import { Produto } from '../produtos/produto.entity';
import { ItemPedido } from '../pedidos/item-pedido.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreatePagamentoDto } from './dtos/create-pagamento.dto';
import { PedidosService } from '../pedidos/pedidos.service';

@Injectable()
export class PagamentosService {

  constructor(
    @InjectRepository(Pagamento) public repo: Repository<Pagamento>,
    @InjectRepository(Pedido) private pedidoRepo: Repository<Pedido>,
    @InjectDataSource() private dataSource: DataSource,
    @Inject(forwardRef(() => PedidosService)) private pedidosService: PedidosService,
  ){}

  async create(dto: CreatePagamentoDto){

    const pedido = await this.pedidoRepo.findOne({ where: { id: dto.pedidoId }, relations: ['itens','itens.produto'] });

    if(!pedido) throw new NotFoundException('Pedido não encontrado');

    if(pedido.status !== PedidoStatus.AGUARDANDO_PAGAMENTO && pedido.status !== PedidoStatus.CRIADO){
      throw new BadRequestException('Pagamento só pode ser criado para pedido CRIADO ou AGUARDANDO_PAGAMENTO');
    }

    const exists = await this.repo.findOne({ 
      where: { 
        pedido: { id: pedido.id } 
      } 
    });

    if(exists && exists.status !== StatusPagamento.CANCELADO) {
      throw new ConflictException('Já existe um pagamento para esse pedido');
    }

    const p = this.repo.create({
      metodo: dto.metodoPagamento,
      valor: dto.valor || pedido.total,
    });
    p.pedido = pedido;
    p.status = StatusPagamento.PENDENTE;
    p.valor = pedido.total;
    
    const saved = await this.repo.save(p);
    
    pedido.status = PedidoStatus.AGUARDANDO_PAGAMENTO;
    await this.pedidoRepo.save(pedido);
    
    return saved;
  }

  async markPaid(id: string){
    const payment = await this.repo.findOne({ where: { id }, relations: ['pedido','pedido.itens','pedido.itens.produto'] });

    if(!payment) throw new NotFoundException('Pagamento não encontrado');
    
    if(payment.status === StatusPagamento.PAGO) throw new BadRequestException('Pagamento já está pago');

    const pedido = payment.pedido;

    if(!pedido) throw new NotFoundException('Pedido não encontrado');

    if(pedido.status !== PedidoStatus.AGUARDANDO_PAGAMENTO){
      throw new BadRequestException('Pedido deve estar AGUARDANDO_PAGAMENTO para confirmar pagamento');
    }

    await this.pedidosService.debitarEstoque(pedido.id);

    payment.status = StatusPagamento.PAGO;
    payment.data = new Date();
    await this.repo.save(payment);
    
    pedido.status = PedidoStatus.PAGO;
    await this.pedidoRepo.save(pedido);
    
    return payment;
  }

  async cancel(id: string, motivoCancelamento?: string){
    const payment = await this.repo.findOne({ where: { id }, relations: ['pedido'] });

    if(!payment) throw new NotFoundException('Pagamento não encontrado');

    if(payment.status === StatusPagamento.CANCELADO) throw new BadRequestException('Pagamento já cancelado');
    
    if(payment.status === StatusPagamento.PAGO) throw new BadRequestException('Não é possível cancelar pagamento já confirmado');

    const pedido = payment.pedido;

    payment.status = StatusPagamento.CANCELADO;
    payment.motivoCancelamento = motivoCancelamento || 'Cancelado pelo usuário';
    await this.repo.save(payment);

    if(pedido && (pedido.status === PedidoStatus.AGUARDANDO_PAGAMENTO || pedido.status === PedidoStatus.CRIADO)){
      await this.pedidosService.liberarEstoque(pedido.id);
      
      pedido.status = PedidoStatus.CANCELADO;
      pedido.motivoCancelamento = motivoCancelamento || 'Pagamento cancelado';
      await this.pedidoRepo.save(pedido);
    }
    
    return payment;
  }
}
