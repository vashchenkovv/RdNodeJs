import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1770576139492 implements MigrationInterface {
  name = 'AddIndexes1770576139492';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_product_id" ON "order_items" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_order_id" ON "order_items" ("order_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_created_at" ON "orders" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_user_id" ON "orders" ("user_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_orders_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_orders_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_order_items_order_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_order_items_product_id"`);
  }
}
