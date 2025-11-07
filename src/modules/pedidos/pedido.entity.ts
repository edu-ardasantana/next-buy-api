import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { ItemPedido } from './item-pedido.entity';

export enum PedidoStatus { ABERTO='ABERTO', AGUARDANDO_PAGAMENTO='AGUARDANDO_PAGAMENTO', PAGO='PAGO', CANCELADO='CANCELADO' }

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  clienteId: string;

  @ManyToOne(() => Cliente, { nullable: true, onDelete: 'SET NULL' })
  cliente: Cliente;

  @Column({ type: 'varchar', default: PedidoStatus.ABERTO })
  status: PedidoStatus;

  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  total: number;

  @Column('int', { default: 0 })
  quantidadeTotal: number;

  @OneToMany(() => ItemPedido, i => i.pedido, { cascade: true })
  itens: ItemPedido[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
