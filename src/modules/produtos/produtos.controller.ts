import { Controller, Get, Query, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateProdutoDto } from './dtos/create-produto.dto';
import { UpdateProdutoDto } from './dtos/update-produto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('produtos')
@Controller('produtos')
export class ProdutosController {

  constructor(private svc: ProdutosService){}

  @Get() findAll(@Query() q){ 
    return this.svc.findAll(q); 
  }

  @Get(':id') findOne(@Param('id') id: string){ 
    return this.svc.findOne(id); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post() create(@Body() dto: CreateProdutoDto){ 
    return this.svc.create(dto); 
  }

  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateProdutoDto){ 
    return this.svc.update(id,dto); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id') remove(@Param('id') id: string){ 
    return this.svc.remove(id); 
  }
}
