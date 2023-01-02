import { MigrationInterface, QueryRunner } from "typeorm"

export class removeSeenColumn1672313367937 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "seen"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
