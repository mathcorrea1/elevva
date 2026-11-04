import { z } from 'zod';
const student = z
  .object({
    id: z.string(),
    name: z.string(),
    version: z.number().int().positive(),
    role: z.enum(['owner', 'guardian', 'teacher']),
    supports: z.array(z.string()),
    confirmed_level: z.string().nullable(),
  })
  .passthrough();
const attempt = z
  .object({
    id: z.string(),
    version: z.number().int().positive(),
    responses: z.record(z.union([z.number().int(),z.string().max(200),z.array(z.string()).max(12),z.record(z.string())])),
    status: z.enum(['in_progress', 'finished']),
  })
  .passthrough();
const report = z
  .object({
    student_id: z.string(),
    completed_tasks: z.number().int().nonnegative(),
    assigned_tasks: z.number().int().nonnegative(),
    comparable_results: z.array(
      z
        .object({ title: z.string(), correct: z.number().int(), responses: z.number().int() })
        .passthrough(),
    ),
    events: z.array(z.unknown()),
    limitations: z.array(z.string()),
    series:z.array(z.object({day:z.string(),activities:z.number().int().nonnegative(),assessments:z.number().int().nonnegative(),observations:z.number().int().nonnegative()})),
    completed_stages:z.number().int().nonnegative(),
    total_stages:z.number().int().nonnegative(),
    achievements:z.array(z.object({id:z.string(),title:z.string(),description:z.string()})),
  })
  .passthrough();
const journeyTask = z.object({id:z.string(),title:z.string(),state:z.enum(['available','locked','in_progress','completed']),locked:z.boolean(),completed_at:z.string().nullable(),instructions:z.string(),item_count:z.number().int().nonnegative(),block_reason:z.string().nullable()});
const journey = z.object({stages:z.array(z.object({id:z.string(),title:z.string(),description:z.string(),state:z.enum(['available','locked','in_progress','completed']),completed:z.number().int().nonnegative(),total:z.number().int().positive(),tasks:z.array(journeyTask)})),completed_tasks:z.number().int().nonnegative(),total_tasks:z.number().int().nonnegative(),assessment_required:z.boolean(),achievements:z.array(z.object({id:z.string(),title:z.string(),description:z.string()})),note:z.string()});
export function validateResponse(path: string, method: string, data: unknown): unknown {
  let schema: z.ZodTypeAny | null = null;
  if (path === '/students') schema = method === 'GET' ? z.array(student) : student;
  else if (/^\/students\/[^/]+(?:\/profile)?$/.test(path)) schema = student;
  else if (/^\/students\/[^/]+\/report(?:\?|$)/.test(path)) schema = report;
  else if (method==='GET'&&/^\/students\/[^/]+\/journey$/.test(path)) schema=journey;
  else if (method==='GET'&&/^\/classrooms\/[^/]+\/report(?:\?|$)/.test(path)) schema=z.object({classroom:z.object({id:z.string(),name:z.string()}).passthrough(),students:z.array(report),note:z.string()});
  else if (
    /\/attempts\/[^/]+\/(responses|finish)$/.test(path) ||
    /\/assignments\/[^/]+\/start$/.test(path)
  )
    schema = attempt;
  if (!schema) return data;
  const result = schema.safeParse(data);
  if (!result.success)
    throw new Error(
      'Resposta incompatível da API. Atualize o aplicativo; nenhum sucesso foi confirmado.',
    );
  return result.data;
}
