import cfg from '../config.js';
import { DataSource } from 'typeorm';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DataBase = new DataSource({
    type: 'postgres',
    host: cfg.postgresHost,
    port: cfg.postgresPort,
    username: cfg.postgresUsername,
    password: cfg.postgresPassword,
    database: 'djinni',
    entities: [__dirname + '/entity/*.entity.js'],
    migrations: [__dirname + '/migrations/*.js'],
    synchronize: true,
    // logging: true,
});

(async () => {
    try {
        await DataBase.initialize();
        console.log('Connected to a database.');
    } catch (err: any) {
        throw new Error(`Could not connect to database ${err.message}`);
    }
})();