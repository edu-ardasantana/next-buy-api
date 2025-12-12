import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
import { CreateClienteDto } from './dtos/create-cliente.dto';
import { UpdateClienteDto } from './dtos/update-cliente.dto';
import { User } from '../auth/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ClientesService {

  constructor(
    @InjectRepository(Cliente) private repo: Repository<Cliente>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateClienteDto){
    return this.repo.save(this.repo.create(dto));
  }

  findAll(){
    return this.repo.find({ relations: ['user'] });
  }

  findOne(id: string){ 
    return this.repo.findOne({ where: { id }, relations: ['enderecos', 'user'] }); 
  }

  async update(id: string, dto: UpdateClienteDto){
    const cliente = await this.findOne(id);
    if(!cliente) throw new NotFoundException('Cliente não encontrado');
    
    if (dto.nome || dto.email || dto.senha) {
      const user = cliente.user;
      
      if (dto.nome) user.nome = dto.nome;
      if (dto.email) user.email = dto.email;
      if (dto.senha) {
        user.senha = await bcrypt.hash(dto.senha, 10);
      }
      
      await this.userRepo.save(user);
    }
    
    if (dto.telefone !== undefined) {
      cliente.telefone = dto.telefone;
    }
    
    return this.repo.save(cliente);
  }
  
  async remove(id: string){
    const cliente = await this.findOne(id);
    if(!cliente) throw new NotFoundException('Cliente não encontrado');
    
    const userId = cliente.user.id;
    
    await this.repo.delete(id);
    
    await this.userRepo.delete(userId);
    
    return { deleted: true };
  }
}
