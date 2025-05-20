import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .email('Correo electrónico inválido')
    .min(1, 'El correo electrónico es requerido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede tener más de 50 caracteres'),
});

export const registerSchema = z.object({
  email: z.string()
    .email('Correo electrónico inválido')
    .min(1, 'El correo electrónico es requerido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede tener más de 50 caracteres'),
  confirmPassword: z.string()
    .min(1, 'Confirma tu contraseña'),
  firstName: z.string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  lastName: z.string()
    .min(1, 'El apellido es requerido')
    .max(50, 'El apellido no puede tener más de 50 caracteres'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});