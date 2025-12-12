import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { EnderecosService } from './enderecos.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateEnderecoDto } from './dtos/create-endereco.dto';
import { UpdateEnderecoDto } from './dtos/update-endereco.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('enderecos')
@Controller('enderecos')
export class EnderecosController {

  constructor(private svc: EnderecosService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Get() findAll(){ 
    return this.svc.findAll(); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Get(':id') findOne(@Param('id') id: string){ 
    return this.svc.findOne(id); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Post() create(@Body() dto: CreateEnderecoDto){ 
    return this.svc.create(dto); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateEnderecoDto){ 
    return this.svc.update(id,dto); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Delete(':id') remove(@Param('id') id: string){ 
    return this.svc.remove(id); 
  }
}
