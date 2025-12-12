import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Endereco } from '../enderecos/endereco.entity';
import { User } from '../auth/user.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  telefone: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @OneToOne(() => User, user => user.cliente)
  @JoinColumn()
  user: User;

  @OneToMany(() => Endereco, e => e.cliente)
  enderecos: Endereco[];
}
