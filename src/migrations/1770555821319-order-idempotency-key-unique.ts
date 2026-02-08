import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderIdempotencyKeyUnique1770555821319 implements MigrationInterface {
  name = 'OrderIdempotencyKeyUnique1770555821319';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "UQ_59d6b7756aeb6cbb43a093d15a1" UNIQUE ("idempotency_key")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "UQ_59d6b7756aeb6cbb43a093d15a1"`,
    );
  }
}
