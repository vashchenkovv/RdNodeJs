import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
@Index('IDX_orders_user_id', ['user'])
@Index('IDX_orders_created_at', ['createdAt'])
@Unique(['idempotencyKey'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @Column({
    type: 'enum',
    enum: OrderStatus,
    enumName: 'orders_status',
    default: OrderStatus.CREATED,
  })
  status: OrderStatus;

  @Column({
    type: 'varchar',
    length: 120,
    name: 'idempotency_key',
    nullable: true,
  })
  idempotencyKey: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
