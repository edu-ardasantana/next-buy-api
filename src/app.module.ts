import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: +configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        logging: configService.get<string>('NODE_ENV') === 'development',
        
        // UPDATE 
        synchronize: true,
        dropSchema: false,
        
        // CREATE-DROP
        // synchronize: true,
        // dropSchema: true,
      }),
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