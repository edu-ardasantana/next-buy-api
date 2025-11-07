import { IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemPedidoDto {
  @ApiProperty({ description: 'ID do produto a ser adicionado ao pedido' })
  @IsUUID()
  produtoId: string;

  @ApiProperty({ description: 'Quantidade do produto', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantidade: number;
}