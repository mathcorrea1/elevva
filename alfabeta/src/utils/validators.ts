import { z } from 'zod';

export const MAX_FIELD = 120;

export const loginSchema = z.object({
  email: z.string().email('auth.validation.email').max(MAX_FIELD),
  password: z.string().min(6, 'auth.validation.password').max(MAX_FIELD),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, 'auth.validation.name').max(MAX_FIELD),
    email: z.string().email('auth.validation.email').max(MAX_FIELD),
    password: z.string().min(8, 'auth.validation.passwordStrong').max(MAX_FIELD),
    confirmPassword: z.string().min(8).max(MAX_FIELD),
    role: z.enum(['guardian', 'teacher']),
    acceptedTerms: z.literal(true),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'auth.validation.passwordMatch',
  });

export const forgotSchema = z.object({
  email: z.string().email('auth.validation.email').max(MAX_FIELD),
});

export const childSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(60),
  birthDate: z
    .string()
    .length(10, 'Data inválida')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Use o formato DD/MM/AAAA'),
  school: z.string().max(80).optional(),
  turma: z.string().max(40).optional(),
  notes: z.string().max(300).optional(),
  observations: z.string().max(1000).optional(),
  /* special needs */
  autism:             z.boolean().optional(),
  dyslexia:          z.boolean().optional(),
  adhd:              z.boolean().optional(),
  dyscalculia:       z.boolean().optional(),
  visualImpairment:  z.boolean().optional(),
  hearingImpairment: z.boolean().optional(),
  specialNeedsOther: z.string().max(200).optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type ForgotForm = z.infer<typeof forgotSchema>;
export type ChildForm = z.infer<typeof childSchema>;
