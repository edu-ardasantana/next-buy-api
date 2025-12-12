import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
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

  @ApiProperty({
    description: 'ID do endereço para entrega',
    required: false
  })
  @IsOptional()
  @IsUUID()
  enderecoId?: string;
}