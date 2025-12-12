import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });

    console.log('Validating user:', email, 'Found user:', user);

    if (user && await bcrypt.compare(pass, user.senha)) {
      const { senha, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, nome: user.nome, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(nome: string, senha: string, email: string, role: string = 'CLIENTE') {
    const hashedSenha = await bcrypt.hash(senha, 10);
    const user = this.userRepository.create({ 
      nome,
      email, 
      senha: hashedSenha, 
      role 
    });
    return this.userRepository.save(user);
  }
}