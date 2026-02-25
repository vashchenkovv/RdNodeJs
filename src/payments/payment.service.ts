import { Injectable } from '@nestjs/common';
import { Payment, PaymentStatus } from './payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async requestCapture(
    orderId: string,
    idempotencyKey: string,
  ): Promise<Payment> {
    const payment = await this.getOrCreatePayment(
      orderId,
      PaymentStatus.PENDING,
    );
    return payment;
  }

  async requestRefund(
    orderId: string,
    idempotencyKey: string,
  ): Promise<Payment> {
    const payment = await this.getOrCreatePayment(orderId);
    if (payment.status === PaymentStatus.REFUNDED) {
      return payment;
    }

    return payment;
  }

  async getOrCreatePayment(
    orderId: string,
    status: PaymentStatus = PaymentStatus.UNPAID,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { orderId },
    });
    if (payment) return payment;
    const newPayment = this.paymentRepository.create({ orderId, status });
    return this.paymentRepository.save(newPayment);
  }
}
