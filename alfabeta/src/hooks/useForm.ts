import type { FieldValues, UseFormProps } from 'react-hook-form';
import { useForm as useReactHookForm } from 'react-hook-form';

/**
 * Thin wrapper around react-hook-form for consistent defaults.
 */
export const useForm = <T extends FieldValues>(props?: UseFormProps<T>) =>
  useReactHookForm<T>({
    mode: 'onChange',
    ...props,
  });
