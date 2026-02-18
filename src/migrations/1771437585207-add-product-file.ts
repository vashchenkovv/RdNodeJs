import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductFile1771437585207 implements MigrationInterface {
  name = 'AddProductFile1771437585207';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "product_file_id" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "products" ADD "avatar_file_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "roles" ALTER COLUMN "scopes" SET DEFAULT ARRAY[]::text[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT ARRAY[]::text[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_444b4c590c9dac5fe9b97521f42" FOREIGN KEY ("avatar_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_444b4c590c9dac5fe9b97521f42"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT ARRAY[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ALTER COLUMN "scopes" SET DEFAULT ARRAY[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "avatar_file_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "product_file_id"`,
    );
  }
}
