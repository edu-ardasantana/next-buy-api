import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';
import { ApiTags } from '@nestjs/swagger';
import { CreatePagamentoDto } from './dtos/create-pagamento.dto';

@ApiTags('pagamentos')
@Controller('pagamentos')
export class PagamentosController {

  constructor(private svc: PagamentosService) {}

  @Post() create(@Body() dto: CreatePagamentoDto){ 
    return this.svc.create(dto); 
  }

  @Post(':id/pagar') pay(@Param('id') id: string){ 
    return this.svc.markPaid(id); 
  }

  @Post(':id/cancelar') cancel(@Param('id') id: string){ 
    return this.svc.cancel(id); 
  }

  @Get()
  findAll(@Query('pedidoId') pedidoId?: string) {
    if (pedidoId) {
      return this.svc.repo.find({ 
        where: { pedido: { id: pedidoId } },
        relations: ['pedido']
      });
    }
    return this.svc.repo.find({ relations: ['pedido'] });
  }

  @Get(':id') findOne(@Param('id') id: string){ 
    return this.svc.repo.findOne({ where: { id } }); 
  }
}
