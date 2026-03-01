import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('processed_messages')
@Index('UQ_processed_messages_message_id', ['messageId'], { unique: true })
export class ProcessedMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'message_id' })
  messageId: string;

  @Column({ type: 'uuid', name: 'product_id' })
  orderId: string;

  @Column({ type: 'varchar', length: 250, name: 'event_name', nullable: true })
  eventName?: string | null;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'processed_at',
    nullable: true,
  })
  processedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
