import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
import { CreateClienteDto } from './dtos/create-cliente.dto';
import { UpdateCategoriaDto } from '../categorias/dtos/update-categoria.dto';

@Injectable()
export class ClientesService {

  constructor(@InjectRepository(Cliente) private repo: Repository<Cliente>) {}

  async create(dto: CreateClienteDto){
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if(exists) throw new ConflictException('Email já cadastrado');
    return this.repo.save(this.repo.create(dto));
  }

  findAll(){
    return this.repo.find(); 
  }

  findOne(id: string){ 
    return this.repo.findOne({ where: { id }, relations: ['enderecos'] }); 
  }

  async update(id: string, dto: UpdateCategoriaDto){
    const c = await this.findOne(id);
    if(!c) throw new NotFoundException('Cliente não encontrado');
    Object.assign(c,dto);
    return this.repo.save(c);
  }
  
  async remove(id: string){
    const c = await this.findOne(id);
    if(!c) throw new NotFoundException('Cliente não encontrado');
    await this.repo.delete(id);
    return { deleted: true };
  }
}
