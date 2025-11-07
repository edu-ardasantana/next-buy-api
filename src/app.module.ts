import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProdutosModule } from './modules/produtos/produtos.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { PagamentosModule } from './modules/pagamentos/pagamentos.module';
import { EnderecosModule } from './modules/enderecos/enderecos.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'nextbuy',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      
      // UPDATE 
      synchronize: true,
      dropSchema: false,
      
      // CREATE-DROP
      // synchronize: true,
      // dropSchema: true,
      
      logging: process.env.NODE_ENV === 'development',
    }),
    ProdutosModule,
    ClientesModule,
    CategoriasModule,
    EnderecosModule,
    PedidosModule,
    PagamentosModule,
    AuthModule,
  ],
})
export class AppModule {}