import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Cliente) private readonly clienteRepo: Repository<Cliente>,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; senha: string }) {
    const user = await this.authService.validateUser(body.email, body.senha);
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    
    const cliente = await this.clienteRepo.findOne({ 
      where: { user: { id: user.id } }
    });
    
    const loginResult = await this.authService.login(user);
    return {
      token: loginResult.access_token,
      user: {
        id: cliente?.id || user.id,
        userId: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        telefone: cliente?.telefone
      }
    };
  }

  @Post('register')
  async register(@Body() body: { nome: string; senha: string; email: string; telefone?: string }) {
    const user = await this.authService.register(body.nome, body.senha, body.email, 'CLIENTE');
    
    if (!user || !user.id) {
      throw new Error('Falha ao criar usuário');
    }
    
    const cliente = this.clienteRepo.create({
      telefone: body.telefone || undefined,
      user: user,
    });
    
    const savedCliente = await this.clienteRepo.save(cliente);
    
    return { 
      user: {
        id: savedCliente.id,
        userId: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        telefone: savedCliente.telefone
      }
    };
  }

  @Post('register-admin')
  async registerAdmin(@Body() body: { nome: string; senha: string; email: string }) {
    return this.authService.register(body.nome, body.senha, body.email, 'ADMIN');
  }
}