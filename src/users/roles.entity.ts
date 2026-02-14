import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryColumn()
  role: string;

  @Column({
    type: 'text',
    array: true,
    default: () => 'ARRAY[]::text[]',
  })
  scopes: string[];

  @Column({ type: 'boolean', default: false })
  isDefCustomerRole: boolean;
}
