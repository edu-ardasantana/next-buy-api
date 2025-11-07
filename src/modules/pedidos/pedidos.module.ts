import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './pedido.entity';
import { ItemPedido } from './item-pedido.entity';
import { Pagamento } from '../pagamentos/pagamento.entity';
import { Produto } from '../produtos/produto.entity';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { ProdutosModule } from '../produtos/produtos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, ItemPedido, Pagamento, Produto]), ProdutosModule],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService, TypeOrmModule],
})
export class PedidosModule {}
