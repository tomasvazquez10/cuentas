import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'El email es requerido')
  .email('Email inválido');

const passwordSchema = z
  .string()
  .min(1, 'La contraseña es requerida')
  .min(6, 'Mínimo 6 caracteres');

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpInputSchema = signInSchema.extend({
  nombre: z.string().trim().optional().default(''),
});

export const signUpFormSchema = signUpInputSchema
  .extend({
    nombre: z.string().trim().min(1, 'El nombre es requerido'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });
