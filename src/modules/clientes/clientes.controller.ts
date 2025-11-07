import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ApiTags } from '@nestjs/swagger';
import { UpdateClienteDto } from './dtos/update-cliente.dto';
import { CreateClienteDto } from './dtos/create-cliente.dto';

@ApiTags('clientes')
@Controller('clientes')
export class ClientesController {

  constructor(private svc: ClientesService) {}

  @Get() findAll(){ 
    return this.svc.findAll(); 
  }

  @Get(':id') findOne(@Param('id') id: string){ 
    return this.svc.findOne(id); 
  }

  @Post() create(@Body() dto: CreateClienteDto){ 
    return this.svc.create(dto); 
  }

  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateClienteDto){ 
    return this.svc.update(id,dto); 
  }

  @Delete(':id') remove(@Param('id') id: string){ 
    return this.svc.remove(id); 
  }
}
