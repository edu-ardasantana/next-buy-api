import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';
import { ApiTags } from '@nestjs/swagger';
import { CreatePagamentoDto } from './dtos/create-pagamento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('pagamentos')
@Controller('pagamentos')
export class PagamentosController {

  constructor(private svc: PagamentosService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Post() create(@Body() dto: CreatePagamentoDto){ 
    return this.svc.create(dto); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Post(':id/pagar') pay(@Param('id') id: string){ 
    return this.svc.markPaid(id); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @Post(':id/cancelar') cancel(@Param('id') id: string){ 
    return this.svc.cancel(id); 
  }
}
