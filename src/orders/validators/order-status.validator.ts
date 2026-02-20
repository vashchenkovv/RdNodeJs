import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { OrderStatus } from '../order.entity';

@ValidatorConstraint({ name: 'orderStatus', async: false })
export class OrderStatusValidator implements ValidatorConstraintInterface {
  validate(value: string) {
    return (Object.values(OrderStatus) as string[]).includes(value);
  }

  defaultMessage() {
    return 'Incorrect document status';
  }
}
