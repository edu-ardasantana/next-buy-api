import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Pedido } from './pedido.entity';
import { Produto } from '../produtos/produto.entity';

@Entity('itens_pedido')
export class ItemPedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pedido, p => p.itens, { onDelete: 'CASCADE' })
  pedido: Pedido;

  @ManyToOne(() => Produto, { eager: true })
  produto: Produto;

  @Column('numeric', { precision: 12, scale: 2 })
  precoUnitario: number;

  @Column('int')
  quantidade: number;

  @Column('numeric', { precision: 12, scale: 2 })
  subtotal: number;
}
