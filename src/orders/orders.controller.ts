import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseDatePipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ListOrdersInput, OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './order.entity';
import { parceLimit, parceOffset } from './utils';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ROLES } from 'src/auth/enums/roles.enum';
import { AuthUser } from 'src/auth/types/auth.type';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request & { user?: AuthUser },
  ): Promise<Order> {
    const order = await this.ordersService.creteOrder(
      createOrderDto,
      req.user?.sub,
    );
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

  @Roles(ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPPORT)
  @Patch(':id/status')
  async updateStatus(
    @Req() req: Request & { user?: AuthUser },
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      id,
      updateOrderStatusDto.status,
      req.user as AuthUser,
    );
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.ordersService.getOne(id);
  }

  @Roles(ROLES.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.ordersService.deleteById(id);
    if (!deleted) {
      throw new NotFoundException('Order not found');
    }
    return { ok: true };
  }
}
