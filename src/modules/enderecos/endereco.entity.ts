import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';

@Entity('enderecos')
export class Endereco {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  clienteId: string;

  @ManyToOne(() => Cliente, c => c.enderecos, { onDelete: 'CASCADE' })
  cliente: Cliente;

  @Column({ nullable: true }) 
  cep: string;

  @Column({ nullable: true }) 
  rua: string;

  @Column({ nullable: true }) 
  numero: string;

  @Column({ nullable: true }) 
  complemento: string;

  @Column({ nullable: true }) 
  cidade: string;

  @Column({ nullable: true }) 
  estado: string;

  @Column({ default: false }) 
  isDefault: boolean;
}
