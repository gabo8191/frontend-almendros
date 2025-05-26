import { z } from 'zod';
import { Role } from '../../auth/types';

// Schema para validar contraseñas
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/\d/, 'Debe contener al menos un número')
  .regex(/[@$!%*?&]/, 'Debe contener al menos un carácter especial (@$!%*?&)');

// Schema para crear empleado
export const createEmployeeSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Correo electrónico inválido'),
  
  password: passwordSchema,
  
  confirmPassword: z.string(),
  
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  
  role: z.nativeEnum(Role),
  
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length > 0, {
      message: 'El teléfono no puede estar vacío'
    }),
  
  address: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length > 0, {
      message: 'La dirección no puede estar vacía'
    })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// Tipos derivados del schema
export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

// Schema para los datos que se envían al servidor (sin confirmPassword)
export const createEmployeeAPISchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Correo electrónico inválido'),
  
  password: passwordSchema,
  
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  
  role: z.nativeEnum(Role),
  
  phoneNumber: z.string().optional(),
  address: z.string().optional()
});

export type CreateEmployeeAPIData = z.infer<typeof createEmployeeAPISchema>;

// Función helper para obtener los requisitos de contraseña
export const getPasswordRequirements = () => [
  'Mínimo 8 caracteres',
  'Al menos una letra minúscula (a-z)',
  'Al menos una letra mayúscula (A-Z)', 
  'Al menos un número (0-9)',
  'Al menos un carácter especial (@$!%*?&)'
];

// Función para validar solo la contraseña y obtener errores específicos
export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Al menos una letra minúscula');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Al menos una letra mayúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Al menos un número');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Al menos un carácter especial (@$!%*?&)');
  }
  
  return errors;
};