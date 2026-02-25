import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrderIdempotencyDto } from './dto/payment-idempotency.dto';
import { CanPayGuard } from './guards/can-pay.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(CanPayGuard)
  @Post(':orderId/pay')
  pay(
    @Param('orderId') orderId: string,
    @Body() orderIdempotencyDto: OrderIdempotencyDto,
  ) {
    return this.paymentsService.requestCapture(
      orderId,
      orderIdempotencyDto.idempotencyKey,
    );
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'support')
  @Post(':orderId/refund')
  async refound(
    @Param('orderId') orderId: string,
    @Body() orderIdempotencyDto: OrderIdempotencyDto,
  ) {
    return this.paymentsService.requestRefund(
      orderId,
      orderIdempotencyDto.idempotencyKey,
    );
  }
}
