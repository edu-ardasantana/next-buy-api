import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(Cliente) 
    private clienteRepo: Repository<Cliente>,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto) {
    // Buscar cliente pelo email
    const cliente = await this.clienteRepo.findOne({
      where: { email: loginDto.email },
      relations: ['enderecos']
    });

    if (!cliente) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(loginDto.senha, cliente.senha);
    
    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Remover senha do retorno por segurança
    const { senha, ...clienteSemSenha } = cliente;

    // Gerar token JWT
    const payload = { email: cliente.email, sub: cliente.id };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Login realizado com sucesso',
      token,
      accessToken: token, // Compatibilidade com frontend
      user: clienteSemSenha,
      cliente: clienteSemSenha,
      timestamp: new Date().toISOString()
    };
  }

  async validateCliente(email: string) {
    const cliente = await this.clienteRepo.findOne({
      where: { email },
      relations: ['enderecos']
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const { senha, ...clienteSemSenha } = cliente;
    return clienteSemSenha;
  }
}