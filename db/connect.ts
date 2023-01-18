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
    database: cfg.postgresDbName,
    entities: [__dirname + '/entity/*.entity.js'],
    migrations: [__dirname + '/migrations/*.js'],
    // logging: true,
    synchronize: true,
});