import { validateResponse } from './validate';

const payload = {
  classroom: { id: 'class-synthetic', name: 'Turma fictícia' },
  students: [],
  student_profiles: [],
  totals: { students: 0, completed_tasks: 0, assessments: 0, observations: 0 },
  series: [],
  pagination: { total: 0, offset: 0, next_offset: null },
  note: 'Somente estudantes autorizados.',
};

it('preserves the aggregate, profiles and pagination consumed by the collective screen', () => {
  expect(validateResponse('/classrooms/class-synthetic/report?offset=0', 'GET', payload)).toEqual(
    payload,
  );
});

it('rejects an incomplete or invalid collective report before rendering a success', () => {
  expect(() =>
    validateResponse('/classrooms/class-synthetic/report', 'GET', {
      ...payload,
      totals: undefined,
    }),
  ).toThrow('Resposta incompatível');
  expect(() =>
    validateResponse('/classrooms/class-synthetic/report', 'GET', {
      ...payload,
      pagination: { ...payload.pagination, total: -1 },
    }),
  ).toThrow('Resposta incompatível');
});
