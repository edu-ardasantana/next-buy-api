import { IsString, IsEmail, IsPhoneNumber, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClienteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  senha?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber('BR')
  telefone?: string;
}
