import { createServer } from 'node:http';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.mjs';
const origins = (process.env.TRUSTED_ORIGINS || '').split(',');
const handler = toNodeHandler(auth);
createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/__eleva/health') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({service: 'eleva-identity', environment: process.env.NODE_ENV,
      database: process.env.DATABASE_URL ? 'postgresql' : 'sqlite'}));
    return;
  }
  const origin = req.headers.origin;
  if (origin && origins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'set-auth-token');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  }
  if (req.method === 'OPTIONS') {res.writeHead(204); res.end(); return;}
  handler(req, res);
}).listen(Number(process.env.PORT || 3001), '127.0.0.1', () => console.log('Better Auth development identity listening. No credentials logged.'));
