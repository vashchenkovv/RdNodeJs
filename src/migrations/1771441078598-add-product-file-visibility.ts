import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductFileVisibility1771441078598 implements MigrationInterface {
  name = 'AddProductFileVisibility1771441078598';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."files_visibility_enum" AS ENUM('private', 'public ')`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD "visibility" "public"."files_visibility_enum" NOT NULL DEFAULT 'private'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT ARRAY[]::text[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ALTER COLUMN "scopes" SET DEFAULT ARRAY[]::text[]`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "roles" ALTER COLUMN "scopes" SET DEFAULT ARRAY[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT ARRAY[]`,
    );
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "visibility"`);
    await queryRunner.query(`DROP TYPE "public"."files_visibility_enum"`);
  }
}
