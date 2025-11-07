import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Realizar login do cliente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        success: true,
        message: 'Login realizado com sucesso',
        cliente: {
          id: 'uuid',
          nome: 'Maria Silva',
          email: 'maria@email.com',
          telefone: '(11) 99999-9999',
          createdAt: '2025-11-06T00:00:00.000Z',
          enderecos: []
        },
        timestamp: '2025-11-06T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Email ou senha inválidos' 
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('validate/:email')
  @ApiOperation({ summary: 'Validar se cliente existe pelo email' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cliente encontrado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cliente não encontrado' 
  })
  async validateCliente(@Param('email') email: string) {
    return this.authService.validateCliente(email);
  }
}