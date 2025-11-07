import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProdutoDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  preco: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  estoque: number;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  categoriaId?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  ativo?: boolean = true;

  @ApiProperty()
  @IsString()
  @IsOptional()
  imagem?: string;
}
