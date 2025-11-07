import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { EnderecosService } from './enderecos.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateEnderecoDto } from './dtos/create-endereco.dto';
import { UpdateEnderecoDto } from './dtos/update-endereco.dto';

@ApiTags('enderecos')
@Controller('enderecos')
export class EnderecosController {

  constructor(private svc: EnderecosService) {}

  @Get() findAll(){ 
    return this.svc.findAll(); 
  }

  @Get(':id') findOne(@Param('id') id: string){ 
    return this.svc.findOne(id); 
  }

  @Post() create(@Body() dto: CreateEnderecoDto){ 
    return this.svc.create(dto); 
  }

  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateEnderecoDto){ 
    return this.svc.update(id,dto); 
  }

  @Delete(':id') remove(@Param('id') id: string){ 
    return this.svc.remove(id); 
  }
}
