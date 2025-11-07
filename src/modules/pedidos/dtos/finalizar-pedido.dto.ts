import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MetodoPagamento } from '../../pagamentos/pagamento.entity';

export class FinalizarPedidoDto {
  @ApiProperty({ 
    description: 'Método de pagamento',
    enum: MetodoPagamento,
    example: 'PIX'
  })
  @IsString()
  @IsEnum(MetodoPagamento)
  metodoPagamento: MetodoPagamento;
}