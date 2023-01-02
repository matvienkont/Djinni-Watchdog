import { MigrationInterface, QueryRunner } from "typeorm"

export class addJobDataColumns1672332848225 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job" ADD COLUMN "company" VARCHAR`);
        await queryRunner.query(`ALTER TABLE "job" ADD COLUMN "recruiter" VARCHAR`);
        await queryRunner.query(`ALTER TABLE "job" ADD COLUMN "description" VARCHAR`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
