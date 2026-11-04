import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';
import nodemailer from 'nodemailer';

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error('Configure a random BETTER_AUTH_SECRET (32+ chars) in identity/.env; never in the APK.');
}
const local = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL;
if (!local && !process.env.DATABASE_URL?.startsWith('postgres')) throw new Error('Configure PostgreSQL');
if (process.env.NODE_ENV === 'production' && (!process.env.SMTP_HOST || !process.env.BETTER_AUTH_URL?.startsWith('https://'))) throw new Error('Production identity requires HTTPS and verified email delivery');
const mail = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD},
}) : null;

export const auth = betterAuth({
  appName: 'Eleva', secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  database: local ? new DatabaseSync('identity-development.db') : new pg.Pool({connectionString: process.env.DATABASE_URL}),
  trustedOrigins: (process.env.TRUSTED_ORIGINS || '').split(',').filter(Boolean),
  emailAndPassword: {
    enabled: true, minPasswordLength: 10, revokeSessionsOnPasswordReset: true,
    requireEmailVerification: process.env.NODE_ENV === 'production',
    ...(mail ? {sendResetPassword: async ({user, url}) => {
      await mail.sendMail({from: process.env.SMTP_FROM, to: user.email, subject: 'Eleva — recuperar acesso', text: `Abra este link para redefinir sua senha: ${url}`});
    }} : {}),
  },
  ...(mail ? {emailVerification: {sendOnSignUp: true, sendVerificationEmail: async ({user, url}) => {
    await mail.sendMail({from: process.env.SMTP_FROM, to: user.email, subject: 'Eleva — confirmar e-mail', text: `Confirme seu e-mail neste link: ${url}`});
  }}} : {}),
  session: {cookieCache: {enabled: false}},
  plugins: [bearer()],
});
