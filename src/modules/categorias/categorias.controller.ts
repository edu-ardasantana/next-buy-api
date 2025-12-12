import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { ApiTags } from '@nestjs/swagger';
import { UpdateCategoriaDto } from './dtos/update-categoria.dto';
import { CreateCategoriaDto } from './dtos/create-categoria.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('categorias')
@Controller('categorias')
export class CategoriasController {

  constructor(private svc: CategoriasService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CLIENTE')
  @Get() findAll(){ 
    return this.svc.findAll(); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CLIENTE')
  @Get(':id') findOne(@Param('id') id: string){ 
    return this.svc.findOne(id); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post() create(@Body() dto: CreateCategoriaDto){ 
    return this.svc.create(dto); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateCategoriaDto){ 
    return this.svc.update(id,dto); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id') remove(@Param('id') id: string){ 
    return this.svc.remove(id); 
  }
}
