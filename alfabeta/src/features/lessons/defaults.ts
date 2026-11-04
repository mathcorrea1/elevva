import type { Question, Mechanic } from './types';
export const newQuestion = (id: string, kind: Mechanic = 'single'): Question => ({
  id,
  kind,
  prompt: '',
  skill: '',
  instruction: '',
  image: null,
  options:
    kind === 'text'
      ? []
      : [
          { id: 'a', text: '' },
          { id: 'b', text: '' },
        ],
  targets:
    kind === 'matching'
      ? [
          { id: 'x', text: '' },
          { id: 'y', text: '' },
        ]
      : [],
  answer:
    kind === 'single'
      ? 'a'
      : kind === 'matching'
        ? { a: 'x', b: 'y' }
        : kind === 'text'
          ? ['']
          : ['a', 'b'],
  required: true,
  reading_allowed: false,
  normalization: {
    ignore_case: true,
    ignore_accents: false,
    collapse_spaces: true,
    unmatched: 'human_review',
  },
  feedback_correct: 'Boa descoberta! Vamos continuar.',
  feedback_incorrect: 'Vamos observar outra possibilidade?',
  hint: '',
  allow_retry: true,
  max_attempts: null,
});
