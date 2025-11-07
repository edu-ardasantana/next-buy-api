import { Controller, Post, Body, Get, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CreatePedidoDto } from './dtos/create-pedido.dto';
import { UpdatePedidoDto } from './dtos/update-pedido.dto';
import { AddItemPedidoDto } from './dtos/add-item-pedido.dto';
import { FinalizarPedidoDto } from './dtos/finalizar-pedido.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('pedidos')
@Controller('pedidos')
export class PedidosController {

  constructor(private svc: PedidosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreatePedidoDto, @CurrentUser() user: any){ 
    // Garantir que o pedido será criado para o cliente autenticado
    return this.svc.create({ ...dto, clienteId: user.id }); 
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar pedidos do cliente autenticado' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por status' })
  findAll(@CurrentUser() user: any, @Query('status') status?: string){ 
    // Sempre filtrar pelo cliente autenticado
    return this.svc.findAll({ clienteId: user.id, status }); 
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string, @CurrentUser() user: any){ 
    const pedido = await this.svc.findOne(id);
    // Validar ownership
    if (pedido && pedido.cliente?.id !== user.id) {
      throw new Error('Não autorizado a acessar este pedido');
    }
    return pedido; 
  }
  
  @Post(':id/itens')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async addItem(@Param('id') id: string, @Body() body: AddItemPedidoDto, @CurrentUser() user: any){
    // Validar ownership antes de adicionar item
    const pedido = await this.svc.findOne(id);
    if (pedido && pedido.cliente?.id !== user.id) {
      throw new Error('Não autorizado a modificar este pedido');
    }
    return this.svc.addItem(id, body.produtoId, body.quantidade);
  }

  @Delete(':pedidoId/itens/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover item do pedido' })
  async removeItem(
    @Param('pedidoId') pedidoId: string, 
    @Param('itemId') itemId: string,
    @CurrentUser() user: any
  ){
    // Validar ownership
    const pedido = await this.svc.findOne(pedidoId);
    if (pedido && pedido.cliente?.id !== user.id) {
      throw new Error('Não autorizado a modificar este pedido');
    }
    return this.svc.removeItem(pedidoId, itemId);
  }

  @Post(':id/finalizar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Finalizar pedido com pagamento (valida estoque, debita e marca como pago)' })
  async finalizar(@Param('id') id: string, @Body() dto: FinalizarPedidoDto, @CurrentUser() user: any){
    // Validar ownership
    const pedido = await this.svc.findOne(id);
    if (pedido && pedido.cliente?.id !== user.id) {
      throw new Error('Não autorizado a finalizar este pedido');
    }
    return this.svc.finalizarPedido(id, dto.metodoPagamento);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() dto: UpdatePedidoDto, @CurrentUser() user: any){ 
    // Validar ownership
    const pedido = await this.svc.findOne(id);
    if (pedido && pedido.cliente?.id !== user.id) {
      throw new Error('Não autorizado a modificar este pedido');
    }
    return this.svc.update(id,dto); 
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @CurrentUser() user: any){ 
    // Validar ownership
    const pedido = await this.svc.findOne(id);
    if (pedido && pedido.cliente?.id !== user.id) {
      throw new Error('Não autorizado a remover este pedido');
    }
    return this.svc.remove(id); 
  }
}
