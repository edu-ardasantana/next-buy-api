import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    description: 'Email do cliente',
    example: 'maria@email.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Senha do cliente',
    example: 'senha123',
    minLength: 6
  })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;
}