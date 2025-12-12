import { Controller, Post, Body, Get, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { CreatePedidoDto } from './dtos/create-pedido.dto';
import { UpdatePedidoDto } from './dtos/update-pedido.dto';
import { AddItemPedidoDto } from './dtos/add-item-pedido.dto';
import { FinalizarPedidoDto } from './dtos/finalizar-pedido.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('pedidos')
@Controller('pedidos')
export class PedidosController {

  constructor(private svc: PedidosService) {}
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Post()
  create(@Body() dto: CreatePedidoDto){ 
    return this.svc.create(dto); 
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Get()
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por status' })
  findAll(@Query('status') status?: string){ 
    return this.svc.findAll(); 
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Get(':id')
  async findOne(@Param('id') id: string){ 
    const pedido = await this.svc.findOne(id);
    return pedido; 
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Post(':id/itens')
  async addItem(@Param('id') id: string, @Body() body: AddItemPedidoDto){
    return this.svc.addItem(id, body.produtoId, body.quantidade);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Delete(':pedidoId/itens/:itemId')
  async removeItem(
    @Param('pedidoId') pedidoId: string, 
    @Param('itemId') itemId: string,
  ){
    const pedido = await this.svc.findOne(pedidoId);
    return this.svc.removeItem(pedidoId, itemId);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePedidoDto){ 
    
    return this.svc.update(id,dto); 
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE') 
  @Delete(':id')
  async remove(@Param('id') id: string){ 
    return this.svc.remove(id); 
  }
}
