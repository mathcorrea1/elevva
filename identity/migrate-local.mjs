import { getMigrations } from 'better-auth/db/migration';
import { auth } from './auth.mjs';
if (process.env.NODE_ENV !== 'development' || process.env.DATABASE_URL) throw new Error('Only local SQLite migration allowed by this command');
const {runMigrations} = await getMigrations(auth.options);
await runMigrations();
console.log('Local development identity schema ready.');
