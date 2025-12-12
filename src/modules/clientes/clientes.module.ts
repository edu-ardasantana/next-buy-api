import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './cliente.entity';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { EnderecosModule } from '../enderecos/enderecos.module';
import { User } from '../auth/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, User]), EnderecosModule],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}
