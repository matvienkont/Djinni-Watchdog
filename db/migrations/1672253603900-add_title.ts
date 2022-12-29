import { MigrationInterface, QueryRunner } from "typeorm"

export class addTitle1672253603900 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_entity" RENAME TO "job"`);
        await queryRunner.query(`ALTER TABLE "job" RENAME COLUMN "jobId" TO "id"`);
        await queryRunner.query(`ALTER TABLE "job" ADD COLUMN "title" VARCHAR`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
