import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { AppGraphQlModule } from './app-graph-ql/app-graph-ql.module';
import { RequestContextMiddleware } from './common/request-context.middleware';
import { TypeOrmRequestContextLogger } from './common/typeorm-logger';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    OrdersModule,
    ProductsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<string>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USER'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        logging: ['query'],
        logger: new TypeOrmRequestContextLogger(),
      }),
    }),
    AppGraphQlModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes({
      path: 'graphql',
      method: RequestMethod.ALL,
    });
  }
}
