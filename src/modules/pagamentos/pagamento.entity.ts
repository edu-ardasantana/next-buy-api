import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Pedido } from '../pedidos/pedido.entity';

export enum MetodoPagamento { 
  PIX = 'PIX', 
  CARTAO_CREDITO = 'CARTAO_CREDITO', 
  CARTAO_DEBITO = 'CARTAO_DEBITO', 
  DINHEIRO = 'DINHEIRO'
}
export enum StatusPagamento { PENDENTE='PENDENTE', PAGO='PAGO', CANCELADO='CANCELADO' }

@Entity('pagamentos')
export class Pagamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pedido)
  pedido: Pedido;

  @Column({ type: 'varchar', nullable: true })
  metodo: MetodoPagamento;

  @Column({ type: 'varchar', nullable: true })
  status: StatusPagamento;

  @Column('numeric', { precision: 12, scale: 2, nullable: true })
  valor: number;

  @Column({ type: 'timestamptz', nullable: true })
  data: Date;

  @Column({ type: 'text', nullable: true })
  motivoCancelamento: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
