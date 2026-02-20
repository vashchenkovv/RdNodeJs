import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  groupBy,
  mergeMap,
  Subject,
  throttleTime,
} from 'rxjs';
import { OrderStatus } from './order.entity';

export type OrderStatusChangedEvent = {
  orderId: string;
  status: OrderStatus;
  version: number;
  ts: number;
};

export type OrderEventsMetrics = {
  received: number;
  dedupDropped: number;
  emitted: number;
};

@Injectable()
export class OrdersEventsService implements OnModuleDestroy {
  private logger = new Logger(OrdersEventsService.name);
  private input$ = new Subject<OrderStatusChangedEvent>();

  public readonly events$ = this.input$.asObservable().pipe(
    groupBy((e) => e.orderId),
    mergeMap((group$) => {
      return group$.pipe(
        distinctUntilChanged((a, b) => a.version === b.version),
        throttleTime(300, undefined, { leading: true, trailing: true }),
        catchError((err) => {
          this.logger.error(
            `orders stream error (orderId=${group$.key})`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            err?.stack ?? String(err),
          );
          return EMPTY;
        }),
      );
    }),
  );

  onModuleDestroy(): void {
    this.input$.complete();
  }

  publishStatusChanged(event: OrderStatusChangedEvent): void {
    this.input$.next(event);
  }
}
