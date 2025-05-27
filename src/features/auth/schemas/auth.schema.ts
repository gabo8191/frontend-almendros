import { z } from 'zod';

/**
 * Base validation rules for reusability
 */
const emailValidation = z.string()
  .min(1, 'El correo electrónico es requerido')
  .email('Correo electrónico inválido')
  .max(100, 'El correo electrónico es demasiado largo');

const passwordValidation = z.string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .max(50, 'La contraseña no puede tener más de 50 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'La contraseña debe contener al menos una minúscula, una mayúscula y un número');

const nameValidation = z.string()
  .min(1, 'Este campo es requerido')
  .max(50, 'No puede tener más de 50 caracteres')
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios');

const phoneValidation = z.string()
  .regex(/^[+]?[\d\s()-]{7,15}$/, 'Formato de teléfono inválido')
  .optional()
  .or(z.literal(''));

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailValidation,
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .max(50, 'La contraseña no puede tener más de 50 caracteres'),
});

/**
 * Registration schema with password confirmation
 */
export const registerSchema = z.object({
  email: emailValidation,
  password: passwordValidation,
  confirmPassword: z.string()
    .min(1, 'Confirma tu contraseña'),
  firstName: nameValidation.refine(
    val => val.trim().length > 0, 
    'El nombre es requerido'
  ),
  lastName: nameValidation.refine(
    val => val.trim().length > 0, 
    'El apellido es requerido'
  ),
  phoneNumber: phoneValidation,
  address: z.string()
    .max(200, 'La dirección no puede tener más de 200 caracteres')
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

/**
 * Type exports for use in components
 */
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
