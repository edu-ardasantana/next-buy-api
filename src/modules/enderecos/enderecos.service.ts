import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Endereco } from './endereco.entity';
import { CreateEnderecoDto } from './dtos/create-endereco.dto';
import { UpdateEnderecoDto } from './dtos/update-endereco.dto';

@Injectable()
export class EnderecosService {

  constructor(@InjectRepository(Endereco) private repo: Repository<Endereco>){ }

  async create(dto: CreateEnderecoDto){ 
    if (dto.isDefault && dto.clienteId) {
      await this.repo.update(
        { clienteId: dto.clienteId, isDefault: true },
        { isDefault: false }
      );
    }
    return this.repo.save(this.repo.create(dto)); 
  }

  findAll(){ 
    return this.repo.find({ relations: ['cliente'] }); 
  }

  findOne(id: string){ 
    return this.repo.findOne({ where: { id }, relations: ['cliente'] }); 
  }

  async update(id: string, dto: UpdateEnderecoDto){
    const e = await this.findOne(id);
    if(!e) throw new NotFoundException('Endereço não encontrado');
    
    if (dto.isDefault && e.clienteId) {
      await this.repo.update(
        { clienteId: e.clienteId, isDefault: true },
        { isDefault: false }
      );
    }
    
    Object.assign(e,dto);
    return this.repo.save(e);
  }
  
  async remove(id: string){
    const e = await this.findOne(id);
    if(!e) throw new NotFoundException('Endereço não encontrado');
    await this.repo.delete(id);
    return { deleted: true };
  }
}
