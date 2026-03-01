import { Body, Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ROLES } from 'src/auth/enums/roles.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthUser } from 'src/auth/types/auth.type';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { OrderTestsService } from './order-tests.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN)
@Controller('tests')
export class TestsController {
  constructor(private orderTestsService: OrderTestsService) {}

  @Post('rebbitmq/orders/emulate-issue')
  emulateQueueissue(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request & { user?: AuthUser },
    @Query('issue') issue?: string,
  ) {
    return this.orderTestsService.testOrdersProcessIssue(
      createOrderDto,
      req.user?.sub ?? null,
      issue ?? null,
    );
  }
}
