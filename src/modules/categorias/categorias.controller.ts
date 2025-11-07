import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { ApiTags } from '@nestjs/swagger';
import { UpdateCategoriaDto } from './dtos/update-categoria.dto';
import { CreateCategoriaDto } from './dtos/create-categoria.dto';

@ApiTags('categorias')
@Controller('categorias')
export class CategoriasController {

  constructor(private svc: CategoriasService) {}

  @Get() findAll(){ 
    return this.svc.findAll(); 
  }

  @Get(':id') findOne(@Param('id') id: string){ 
    return this.svc.findOne(id); 
  }

  @Post() create(@Body() dto: CreateCategoriaDto){ 
    return this.svc.create(dto); 
  }

  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateCategoriaDto){ 
    return this.svc.update(id,dto); 
  }

  @Delete(':id') remove(@Param('id') id: string){ 
    return this.svc.remove(id); 
  }
}
