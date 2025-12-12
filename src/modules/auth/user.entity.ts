import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column()
  senha: string;

  @Column({ default: 'CLIENTE' })
  role: string;

  @OneToOne(() => Cliente, cliente => cliente.user, { nullable: true })
  cliente: Cliente;
}