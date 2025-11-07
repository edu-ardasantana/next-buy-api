import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Endereco } from '../enderecos/endereco.entity';
import * as bcrypt from 'bcrypt';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column()
  senha: string;

  @Column({ nullable: true })
  telefone: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @OneToMany(() => Endereco, e => e.cliente)
  enderecos: Endereco[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(){
    if(this.senha && !this.senha.startsWith('$2b$')){
      // Só faz hash se a senha ainda não estiver hasheada (bcrypt começa com $2b$)
      const salt = await bcrypt.genSalt(10);
      this.senha = await bcrypt.hash(this.senha, salt);
    }
  }
}
