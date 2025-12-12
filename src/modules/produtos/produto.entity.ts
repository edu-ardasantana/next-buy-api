import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Categoria } from '../categorias/categoria.entity';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ nullable: true, type: 'text' })
  descricao: string;

  @Column('numeric', { precision: 12, scale: 2 })
  preco: number;

  @Column('int', { default: 0 })
  estoque: number;

  @Column('int', { default: 0 })
  estoqueReservado: number;

  @Column({ nullable: true })
  categoriaId: string;

  @ManyToOne(() => Categoria, c => c.produtos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoriaId' })
  categoria: Categoria;

  @Column({ default: true })
  ativo: boolean;

  @Column({ nullable: true })
  imagem: string;
}
