import { Controller, Get, Query, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateProdutoDto } from './dtos/create-produto.dto';
import { UpdateProdutoDto } from './dtos/update-produto.dto';

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

  @Post() create(@Body() dto: CreateProdutoDto){ 
    return this.svc.create(dto); 
  }

  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateProdutoDto){ 
    return this.svc.update(id,dto); 
  }

  @Delete(':id') remove(@Param('id') id: string){ 
    return this.svc.remove(id); 
  }
}
