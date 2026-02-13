import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppGraphQlService } from './app-graph-ql.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/order.entity';
import { OrderItem } from 'src/orders/order-item.entity';
import { Product } from 'src/products/product.entity';
import { User } from 'src/users/user.entity';
import { OrderResolver } from './resolvers/order.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, User]),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => ({
        autoSchemaFile: true,
        path: '/graphql',
        graphiql: true,
        introspection: true,
        context: () => ({}),
      }),
    }),
  ],
  providers: [AppGraphQlService, OrderResolver],
})
export class AppGraphQlModule {}
