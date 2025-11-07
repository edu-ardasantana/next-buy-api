import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './categoria.entity';
import { CreateCategoriaDto } from './dtos/create-categoria.dto';
import { UpdateCategoriaDto } from './dtos/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(@InjectRepository(Categoria) private repo: Repository<Categoria>) {}

  findAll(){ return this.repo.find(); }

  findOne(id: string){ 
    return this.repo.findOne({ where: { id } }); 
  }

  create(dto: CreateCategoriaDto){ 
    return this.repo.save(this.repo.create(dto)); 
  }

  async update(id: string, dto: UpdateCategoriaDto){
    const cat = await this.findOne(id);
    if(!cat) throw new NotFoundException('Categoria não encontrada');
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }
  
  async remove(id: string){
    const cat = await this.findOne(id);
    if(!cat) throw new NotFoundException('Categoria não encontrada');
    await this.repo.delete(id);
    return { deleted: true };
  }
}
