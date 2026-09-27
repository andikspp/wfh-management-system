import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { createConnection } from 'mysql2/promise';
import { DataSource } from 'typeorm';
import { Role } from '../constants';
import { ENTITIES, User } from '../entities';

dotenv.config();

async function main() {
  const dbName = process.env.DB_NAME || 'dexa_wfh';
  const base = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  const conn = await createConnection(base);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();

  const ds = new DataSource({
    type: 'mysql',
    ...base,
    username: base.user,
    database: dbName,
    entities: ENTITIES,
    synchronize: true,
    timezone: 'local',
  });
  await ds.initialize();

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@dexa.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const repo = ds.getRepository(User);
  if (await repo.findOne({ where: { email } })) {
    console.log(`Admin ${email} sudah ada, skip.`);
  } else {
    await repo.save(repo.create({ email, passwordHash: await bcrypt.hash(password, 10), role: Role.ADMIN }));
    console.log(`Admin dibuat: ${email} / ${password}`);
  }
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
