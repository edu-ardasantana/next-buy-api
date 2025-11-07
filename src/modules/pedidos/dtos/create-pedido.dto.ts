import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PedidoStatus {
  ABERTO = 'ABERTO',
  AGUARDANDO_PAGAMENTO = 'AGUARDANDO_PAGAMENTO',
  PAGO = 'PAGO',
  CANCELADO = 'CANCELADO',
}

export class CreatePedidoDto {
  @ApiProperty()
  @IsUUID()
  clienteId: string;

  @ApiProperty({ enum: PedidoStatus, required: false })
  @IsOptional()
  @IsEnum(PedidoStatus)
  status?: PedidoStatus = PedidoStatus.ABERTO;
}
