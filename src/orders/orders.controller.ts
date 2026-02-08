import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  ParseDatePipe,
  Post,
  Query,
} from '@nestjs/common';
import { ListOrdersInput, OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './order.entity';
import { parceLimit, parceOffset } from './utils';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    const order = await this.ordersService.creteOrder(createOrderDto);
    if (!order) throw new InternalServerErrorException('Internal Server Error');
    return order;
  }

  @Get()
  orderList(
    @Query('userId') userId?: string,
    @Query('status') status?: OrderStatus,
    @Query(
      'from',
      new ParseDatePipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
        optional: true,
      }),
    )
    from?: Date,
    @Query(
      'to',
      new ParseDatePipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
        optional: true,
      }),
    )
    to?: Date,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Order[]> {
    const safeLimit = parceLimit(limit);
    const safeOffset = parceOffset(offset);

    const param: ListOrdersInput = {
      userId,
      status,
      from,
      to,
      limit: safeLimit,
      offset: safeOffset,
    };

    return this.ordersService.orderList(param);
  }
}
