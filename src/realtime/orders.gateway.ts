import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Subject, takeUntil } from 'rxjs';
import { JwtPayload } from 'src/auth/types/auth.type';
import {
  OrdersEventsService,
  OrderStatusChangedEvent,
} from 'src/orders/orders-events.service';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { OrdersService } from 'src/orders/orders.service';

type SubscribeOrderPayload = {
  orderId: string;
};

type RealtimeClientData = {
  user?: JwtPayload;
  subscribeCalls?: number[];
};

@WebSocketGateway({ namespace: '/realtime', cors: { origin: true } })
export class OrdersGateway
  implements
    OnModuleInit,
    OnModuleDestroy,
    OnGatewayConnection,
    OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private logger = new Logger(OrdersGateway.name);
  private destroy$ = new Subject<void>();

  constructor(
    private ordersEventsService: OrdersEventsService,
    private jwtService: JwtService,
    private ordersService: OrdersService,
  ) {}

  onModuleInit(): void {
    this.ordersEventsService.events$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (event) => this.emitOrderStatus(event),
      error: (err) => {
        this.logger.error(
          'orders events subscription failed',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          err?.stack ?? String(err),
        );
      },
    });
  }

  onModuleDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    const token = this.getTokenFromHandshake(client);
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      (client.data as RealtimeClientData).user = payload;
      (client.data as RealtimeClientData).subscribeCalls = [];
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.warn(`WS auth failed: ${err?.message ?? String(err)}`);
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    const data = client.data as RealtimeClientData;
    if (data.subscribeCalls) {
      data.subscribeCalls.length = 0;
    }
  }

  @SubscribeMessage('subscribeOrder')
  async subscribeOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscribeOrderPayload,
  ): Promise<{ ok: true }> {
    //#region Можна винести в декоратори
    this.assertRateLimit(client);

    const orderId = payload?.orderId;
    if (!orderId || typeof orderId !== 'string') {
      throw new WsException('orderId is required');
    }

    const user = (client.data as RealtimeClientData).user;
    if (!user) {
      throw new WsException('Unauthenticated');
    }
    //#endregion Можна винести в декоратори

    try {
      await this.ordersService.canSubscribeToOrder(orderId, user);
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const message = err?.message ?? 'Subscription denied';
      this.logger.warn(
        `subscribeOrder denied userId=${user.sub} orderId=${orderId} reason=${message}`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new WsException(message);
    }

    await client.join(this.orderRoom(orderId));

    this.logger.log(`subscribeOrder userId=${user.sub} orderId=${orderId}`);

    return { ok: true };
  }

  @SubscribeMessage('unsubscribeOrder')
  async unsubscribeOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscribeOrderPayload,
  ): Promise<{ ok: true }> {
    const orderId = payload?.orderId;
    if (!orderId || typeof orderId !== 'string') {
      throw new WsException('orderId is required');
    }

    await client.leave(this.orderRoom(orderId));
    return { ok: true };
  }

  private getTokenFromHandshake(client: Socket): string | null {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const authToken = (client.handshake.auth as any)?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const header = client.handshake.headers?.authorization;
    if (
      typeof header === 'string' &&
      header.toLowerCase().startsWith('bearer ')
    ) {
      return header.slice('bearer '.length).trim();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const queryToken = (client.handshake.query as any)?.token;
    if (typeof queryToken === 'string' && queryToken.length > 0) {
      return queryToken;
    }

    return null;
  }

  private assertRateLimit(client: Socket): void {
    const data = client.data as RealtimeClientData;
    const now = Date.now();
    const windowMs = 3000;
    const maxCalls = 5;

    if (!data.subscribeCalls) {
      data.subscribeCalls = [];
    }

    data.subscribeCalls = data.subscribeCalls.filter((t) => now - t < windowMs);
    if (data.subscribeCalls.length >= maxCalls) {
      throw new WsException('Rate limit exceeded');
    }

    data.subscribeCalls.push(now);
  }

  private orderRoom(orderId: string): string {
    return `order:${orderId}`;
  }

  private emitOrderStatus(event: OrderStatusChangedEvent): void {
    this.server.to(this.orderRoom(event.orderId)).emit('order.status', event);
  }
}
