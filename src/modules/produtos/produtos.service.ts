import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './produto.entity';
import { UpdateProdutoDto } from './dtos/update-produto.dto';
import { CreateProdutoDto } from './dtos/create-produto.dto';

@Injectable()
export class ProdutosService {

  constructor(@InjectRepository(Produto) private repo: Repository<Produto>){ }

  findAll(q?: any){
    const qb = this.repo.createQueryBuilder('p').leftJoinAndSelect('p.categoria','categoria');

    if(q?.nome) qb.andWhere('p.nome ILIKE :nome',{nome:`%${q.nome}%`});

    if(q?.categoria) qb.andWhere('categoria.id = :cat',{cat:q.categoria});

    if(q?.precoMin) qb.andWhere('p.preco >= :min',{min:q.precoMin});

    if(q?.precoMax) qb.andWhere('p.preco <= :max',{max:q.precoMax});

    return qb.getMany();
  }

  findOne(id: string){ 
    return this.repo.findOne({ where: { id }, relations: ['categoria'] }); 
  }

  create(dto: CreateProdutoDto){ 
    return this.repo.save(this.repo.create(dto)); 
  }

  async update(id: string, dto: UpdateProdutoDto){
    const p = await this.findOne(id);

    if(!p) throw new NotFoundException('Produto não encontrado');

    Object.assign(p,dto);

    return this.repo.save(p);
  }

  async remove(id: string){
    const p = await this.findOne(id);

    if(!p) throw new NotFoundException('Produto não encontrado');

    await this.repo.delete(id);
    
    return { deleted: true };
  }
}
