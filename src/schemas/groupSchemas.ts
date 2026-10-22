import { z } from 'zod';
import {
  localDateSchema,
  nonNegativeAmountSchema,
  positiveAmountSchema,
  positiveAmountTextSchema,
} from './common';
import { movimientoInputSchema } from './financialSchemas';

const tipoDivisionSchema = z.enum(['IGUALITARIO', 'PORCENTAJE', 'MONTO_FIJO']);

export const crearGrupoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre del grupo es obligatorio'),
  descripcion: z.string().trim().nullable(),
});

export const actualizarGrupoSchema = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre del grupo es obligatorio').optional(),
    descripcion: z.string().trim().nullable().optional(),
  })
  .refine((values) => Object.keys(values).length > 0, {
    message: 'Indica al menos un campo para actualizar',
  });

export const gastoCompartidoFormSchema = z
  .object({
    fecha: localDateSchema,
    tipoMovimiento: z.enum(['GASTO', 'ENTRADA', 'AHORRO', 'INVERSION']),
    subtipo: z.string().trim().min(1),
    metodo: z.enum(['EFECTIVO', 'VISA', 'AMEX', 'MERCADOPAGO']),
    concepto: z.string().trim().min(1, 'Completa los campos requeridos (Concepto y Monto)'),
    monto: positiveAmountTextSchema,
    tipoDivision: tipoDivisionSchema,
    pagadoPorUsuarioId: z.string(),
    participantesSeleccionados: z.array(z.string().min(1)),
    miembrosDisponibles: z.array(z.string()),
  })
  .superRefine((values, context) => {
    if (values.miembrosDisponibles.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['miembrosDisponibles'],
        message: 'El grupo no tiene miembros para dividir el gasto',
      });
      return;
    }

    if (!values.miembrosDisponibles.includes(values.pagadoPorUsuarioId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pagadoPorUsuarioId'],
        message: 'Selecciona quien pago el gasto',
      });
    }

    if (
      values.participantesSeleccionados.some(
        (usuarioId) => !values.miembrosDisponibles.includes(usuarioId)
      )
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['participantesSeleccionados'],
        message: 'Selecciona participantes válidos',
      });
    }

    if (values.participantesSeleccionados.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['participantesSeleccionados'],
        message: 'Selecciona a quien le corresponde el gasto',
      });
    }
  })
  .transform(({ miembrosDisponibles: _miembros, ...values }) => values);

export const gastoCompartidoDtoSchema = z.object({
  movimiento: movimientoInputSchema,
  grupoId: z.string().min(1, 'ID de grupo requerido'),
  tipoDivision: tipoDivisionSchema,
  pagadoPorUsuarioId: z.string().min(1).optional(),
  participantes: z
    .array(
      z.object({
        usuarioId: z.string().min(1),
        porcentaje: z.number().min(0).max(100).optional(),
        montoCorrespondiente: nonNegativeAmountSchema,
      })
    )
    .min(1, 'Debe haber al menos un participante en el gasto compartido'),
});

export type CrearGastoCompartidoDTO = z.infer<typeof gastoCompartidoDtoSchema>;
