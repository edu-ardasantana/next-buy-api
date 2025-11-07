import { IsUUID, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MetodoPagamento, StatusPagamento } from '../pagamento.entity';

export class CreatePagamentoDto {
  @ApiProperty()
  @IsUUID()
  pedidoId: string;

  @ApiProperty({ enum: MetodoPagamento })
  @IsEnum(MetodoPagamento)
  @IsOptional()
  metodo?: MetodoPagamento;

  // Aceita ambos para compatibilidade
  @ApiProperty({ enum: MetodoPagamento })
  @IsEnum(MetodoPagamento)
  @IsOptional()
  metodoPagamento?: MetodoPagamento;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  valor?: number;

  @ApiProperty({ enum: StatusPagamento, required: false })
  @IsOptional()
  @IsEnum(StatusPagamento)
  status?: StatusPagamento = StatusPagamento.PENDENTE;
}
