import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexesToUrl1740319402010 implements MigrationInterface {
    name = 'AddIndexesToUrl1740319402010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_34ced802e4a45bf6a6346f2eb9" ON "urls" ("shortCode") `);
        await queryRunner.query(`CREATE INDEX "IDX_f2d344bf5b161716db43ead911" ON "urls" ("longUrl") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_f2d344bf5b161716db43ead911"`);
        await queryRunner.query(`DROP INDEX "IDX_34ced802e4a45bf6a6346f2eb9"`);
    }

}
