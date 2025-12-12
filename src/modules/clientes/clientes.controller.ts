import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ApiTags } from '@nestjs/swagger';
import { UpdateClienteDto } from './dtos/update-cliente.dto';
import { CreateClienteDto } from './dtos/create-cliente.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('clientes')
@Controller('clientes')
export class ClientesController {

  constructor(private svc: ClientesService) {}


  @Post() create(@Body() dto: CreateClienteDto){ 
    return this.svc.create(dto); 
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get() findAll(){ 
    return this.svc.findAll(); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id') findOne(@Param('id') id: string){ 
    return this.svc.findOne(id); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateClienteDto){ 
    return this.svc.update(id,dto); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE', 'ADMIN')
  @Delete(':id') remove(@Param('id') id: string){ 
    return this.svc.remove(id); 
  }
}
