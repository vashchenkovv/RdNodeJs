import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderStatusVersion1771617543120 implements MigrationInterface {
  name = 'AddOrderStatusVersion1771617543120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "status_version" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ALTER COLUMN "scopes" SET DEFAULT ARRAY[]::text[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT ARRAY[]::text[]`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT ARRAY[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ALTER COLUMN "scopes" SET DEFAULT ARRAY[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "status_version"`,
    );
  }
}
