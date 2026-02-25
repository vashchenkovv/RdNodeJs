import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { ROLE_SCOPE } from 'src/auth/enums/role-scope.enum';
import { ROLES } from 'src/auth/enums/roles.enum';
import { AuthUser } from 'src/auth/types/auth.type';
import { hasScopeUtil } from 'src/auth/utils/has-scope.util';
import { isStuffUtil } from 'src/auth/utils/is-staff.util';
import { Order } from 'src/orders/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CanPayGuard implements CanActivate {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();

    const orderId: string = String(req.params?.orderId ?? '');
    if (!orderId) {
      throw new NotFoundException('Order not found');
    }

    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const user: AuthUser = req.user as AuthUser;
    if (!user) {
      throw new ForbiddenException('Unauthenticated');
    }

    const isOwner = order.userId === user.sub;
    if (isOwner) {
      return true;
    }

    const hasScope = hasScopeUtil(user, [
      ROLE_SCOPE.PAYMENT_ALL,
      ROLE_SCOPE.PAYMENT_CREATE,
      ROLE_SCOPE.PAYMENT_UPDATE,
    ]);

    if (isStuffUtil(user.roles as ROLES[]) && hasScope) {
      return true;
    }

    throw new ForbiddenException('Not allowed to pay this order');
  }
}
