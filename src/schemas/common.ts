import { z, ZodError } from 'zod';

export const localDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha válida')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, 'Selecciona una fecha válida');

export const positiveAmountSchema = z
  .number({ invalid_type_error: 'Ingresa un monto válido' })
  .finite('Ingresa un monto válido')
  .positive('Ingresa un monto mayor a cero');

export const nonNegativeAmountSchema = z
  .number({ invalid_type_error: 'Ingresa un monto válido' })
  .finite('Ingresa un monto válido')
  .min(0, 'El monto no puede ser negativo');

export const parseLocalizedAmount = (value: string) => {
  const trimmed = value.trim();
  const hasComma = trimmed.includes(',');
  const hasDot = trimmed.includes('.');
  let normalized = trimmed;

  if (hasComma && hasDot) {
    normalized = trimmed.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    normalized = trimmed.replace(',', '.');
  } else if (hasDot && !/^\d+\.\d{1,2}$/.test(trimmed)) {
    normalized = trimmed.replace(/\./g, '');
  }

  return Number(normalized);
};

export const positiveAmountTextSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa un monto mayor a cero')
  .transform((value, context) => {
    const amount = parseLocalizedAmount(value);
    if (!Number.isFinite(amount) || amount <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ingresa un monto mayor a cero',
      });
      return z.NEVER;
    }
    return amount;
  });

export const getFormErrors = (error: ZodError): Record<string, string> =>
  error.issues.reduce<Record<string, string>>((errors, issue) => {
    const field = issue.path[0];
    if (field !== undefined && !errors[String(field)]) {
      errors[String(field)] = issue.message;
    }
    return errors;
  }, {});
