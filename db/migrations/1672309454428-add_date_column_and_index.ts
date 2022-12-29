import { MigrationInterface, QueryRunner } from "typeorm"

export class addDateColumnAndIndex1672309454428 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job" ADD COLUMN "date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "job" ALTER COLUMN "date" SET DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX date_idx ON job(date DESC)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
