// No secret values printed. Fail before producing a release aimed at localhost.
const fs = require('fs');
if (process.loadEnvFile && fs.existsSync('.env.local')) process.loadEnvFile('.env.local');
for (const name of ['EXPO_PUBLIC_API_URL', 'EXPO_PUBLIC_AUTH_URL']) {
  const value = process.env[name];
  let url;
  try { url = new URL(value); } catch { throw new Error(`Configure ${name} with the final HTTPS endpoint before building.`); }
  if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(url.hostname)) throw new Error(`${name} must be a remotely reachable HTTPS endpoint.`);
}
console.log('Public HTTPS endpoints configured. This check does not prove remote availability.');
