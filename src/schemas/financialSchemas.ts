import { z } from 'zod';
import { MovimientoInput } from '@models/index';
import {
  localDateSchema,
  positiveAmountSchema,
  positiveAmountTextSchema,
} from './common';

const tipoMovimientoSchema = z.enum(['GASTO', 'ENTRADA', 'AHORRO', 'INVERSION']);
const subtipoMovimientoSchema = z.string().trim().min(1, 'Selecciona una categoría');
const metodoMovimientoSchema = z.enum(['EFECTIVO', 'VISA', 'AMEX', 'MERCADOPAGO']);

const movimientoFieldsSchema = z.object({
  fecha: localDateSchema,
  tipo: tipoMovimientoSchema,
  subtipo: subtipoMovimientoSchema,
  concepto: z.string().trim().min(1, 'Completa el concepto'),
  metodo: metodoMovimientoSchema,
  monto: positiveAmountSchema,
  nota: z.string().optional(),
  cuota_actual: z.number().int().positive().optional(),
  total_cuotas: z.number().int().positive().optional(),
  compra_id: z.string().optional(),
});

const validateCuotas = (
  values: { cuota_actual?: number; total_cuotas?: number },
  context: z.RefinementCtx,
  requirePair: boolean
) => {
  const hasCuota = values.cuota_actual !== undefined;
  const hasTotal = values.total_cuotas !== undefined;

  if (requirePair && hasCuota !== hasTotal) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [hasCuota ? 'total_cuotas' : 'cuota_actual'],
      message: 'Indica una cuota válida, por ejemplo 1 de 6',
    });
  } else if (
    hasCuota &&
    hasTotal &&
    values.cuota_actual! > values.total_cuotas!
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['total_cuotas'],
      message: 'El total de cuotas debe ser igual o mayor a la cuota actual',
    });
  }
};

export const movimientoInputSchema = movimientoFieldsSchema.superRefine(
  (values, context) => validateCuotas(values, context, true)
);

export const movimientoUpdateSchema = movimientoFieldsSchema
  .partial()
  .superRefine((values, context) => validateCuotas(values, context, false))
  .refine((values) => Object.keys(values).length > 0, {
    message: 'Indica al menos un campo para actualizar',
  });

const movimientoFormFieldsSchema = z.object({
  fecha: localDateSchema,
  tipo: tipoMovimientoSchema,
  subtipo: subtipoMovimientoSchema,
  concepto: z.string().trim().min(1, 'Completa el concepto'),
  metodo: metodoMovimientoSchema,
  monto: positiveAmountTextSchema,
  nota: z.string(),
  cuotaActual: z.string(),
  totalCuotas: z.string(),
});

export const movimientoFormSchema = movimientoFormFieldsSchema
  .superRefine((values, context) => {
    const cuota = values.cuotaActual.trim();
    const total = values.totalCuotas.trim();
    if (!cuota && !total) return;

    const cuotaActual = Number(cuota);
    const totalCuotas = Number(total);
    if (
      !Number.isInteger(cuotaActual) ||
      !Number.isInteger(totalCuotas) ||
      cuotaActual < 1 ||
      totalCuotas < cuotaActual
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cuotaActual'],
        message: 'Indica una cuota válida, por ejemplo 1 de 6',
      });
    }
  })
  .transform((values): MovimientoInput => {
    const cuotaActual = values.cuotaActual.trim();
    const totalCuotas = values.totalCuotas.trim();
    const hasCuotas = !!cuotaActual && !!totalCuotas;
    return {
      fecha: values.fecha,
      tipo: values.tipo,
      subtipo: values.subtipo,
      concepto: values.concepto,
      metodo: values.metodo,
      monto: values.monto,
      nota: values.nota || undefined,
      cuota_actual: hasCuotas ? Number(cuotaActual) : undefined,
      total_cuotas: hasCuotas ? Number(totalCuotas) : undefined,
    };
  });

const pagoFieldsSchema = z.object({
  fecha: localDateSchema,
  servicio: z.string().trim().min(1, 'Ingresa el nombre del servicio'),
  monto: positiveAmountSchema,
  pago: z.boolean(),
});

export const calendarioPagoInputSchema = pagoFieldsSchema;
export const calendarioPagoUpdateSchema = pagoFieldsSchema
  .partial()
  .refine((values) => Object.keys(values).length > 0, {
    message: 'Indica al menos un campo para actualizar',
  });

export const pagoFormSchema = z.object({
  fecha: localDateSchema,
  servicio: z.string().trim().min(1, 'Ingresa el nombre del servicio'),
  monto: positiveAmountTextSchema,
});

export const pagoEdicionFormSchema = z.object({
  fecha: localDateSchema,
  monto: positiveAmountTextSchema,
});
