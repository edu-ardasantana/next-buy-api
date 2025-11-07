import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnderecoDto {
  @ApiProperty()
  @IsUUID()
  clienteId: string;

  @ApiProperty()
  @IsString()
  rua: string;

  @ApiProperty()
  @IsString()
  numero: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  complemento?: string;

  @ApiProperty()
  @IsString()
  cidade: string;

  @ApiProperty()
  @IsString()
  estado: string;

  @ApiProperty()
  @IsString()
  cep: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;
}
