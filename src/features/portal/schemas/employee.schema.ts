import { z } from 'zod';
import { Role } from '../../auth/types';
import {
  isValidEmailDomain,
  isTemporaryEmail,
  getRecommendedEmailDomains,
} from '../../../shared/constants'; // Cambiar a index.ts
import {
  FIELD_LENGTHS,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
} from '../../../shared/constants'; // Cambiar a index.ts

// ... resto del código igual


// Schema para la validación del teléfono internacional (opcional para empleados)
const phoneSchema = z
  .string()
  .optional()
  .refine(
    (phone) => {
      if (!phone || phone.trim() === '') return true; // Opcional
      return REGEX_PATTERNS.INTERNATIONAL_PHONE.test(phone);
    },
    {
      message: ERROR_MESSAGES.INVALID.PHONE,
    }
  );

// Schema mejorado para email con validación de dominios temporales
const emailSchema = z
  .string()
  .min(1, ERROR_MESSAGES.REQUIRED.EMAIL)
  .email(ERROR_MESSAGES.INVALID.EMAIL)
  .max(FIELD_LENGTHS.EMAIL.MAX, ERROR_MESSAGES.LENGTH.EMAIL_MAX)
  .trim()
  .toLowerCase()
  .refine(
    (email) => isValidEmailDomain(email),
    {
      message: ERROR_MESSAGES.BUSINESS.TEMPORARY_EMAIL,
    }
  );

// Schema para contraseña con requisitos específicos
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
  .regex(/\d/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial');

// Schema base para empleados
const baseEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(FIELD_LENGTHS.NAME.MIN, 'El nombre debe tener al menos 2 caracteres')
    .max(FIELD_LENGTHS.NAME.MAX, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(FIELD_LENGTHS.NAME.MIN, 'El apellido debe tener al menos 2 caracteres')
    .max(FIELD_LENGTHS.NAME.MAX, 'El apellido no puede exceder 100 caracteres')
    .trim(),
  
  email: emailSchema,
  
  phoneNumber: phoneSchema,
  
  address: z
    .string()
    .max(FIELD_LENGTHS.ADDRESS.MAX, ERROR_MESSAGES.LENGTH.ADDRESS_MAX)
    .trim()
    .optional(),
});

// Schema para crear empleado (incluye contraseña y rol)
export const createEmployeeSchema = baseEmployeeSchema.extend({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Debe confirmar la contraseña'),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: 'Rol inválido' }),
  }),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  }
);

// Schema para editar empleado (sin contraseña, sin rol)
export const updateEmployeeSchema = baseEmployeeSchema.partial();

// Schema para validación en tiempo real de edición
export const editEmployeeFormSchema = z.object({
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  email: z.string().trim(),
  phoneNumber: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

// Tipos derivados de los schemas
export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormData = z.infer<typeof editEmployeeFormSchema>;
export type EditEmployeeData = z.infer<typeof updateEmployeeSchema>;

// Función helper para formatear número de teléfono
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remover todos los caracteres que no sean números
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Si ya empieza con código de país (ej: 57), agregar el +
  if (cleanPhone.length >= 10) {
    // Si no empieza con 57 (Colombia), asumimos que es un número nacional
    if (!cleanPhone.startsWith('57')) {
      return `+57${cleanPhone}`;
    } else {
      return `+${cleanPhone}`;
    }
  }
  
  return phone; // Devolver el original si no se puede formatear
};

// Re-exportar las funciones de email para conveniencia
export { isTemporaryEmail, getRecommendedEmailDomains };

// Funciones helper para validación de contraseña
export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Al menos una minúscula');
  }
  if (!/\d/.test(password)) {
    errors.push('Al menos un número');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Al menos un carácter especial');
  }
  
  return errors;
};

export const getPasswordRequirements = (): string[] => {
  return [
    'Mínimo 8 caracteres',
    'Al menos una letra mayúscula',
    'Al menos una letra minúscula',
    'Al menos un número',
    'Al menos un carácter especial'
  ];
};

// Función helper para validar el formulario de edición
export const validateEditEmployeeForm = (data: UpdateEmployeeFormData): { 
  isValid: boolean; 
  errors: Record<string, string> 
} => {
  try {
    // Formatear el teléfono antes de validar
    const dataToValidate = {
      ...data,
      phoneNumber: data.phoneNumber ? formatPhoneNumber(data.phoneNumber) : data.phoneNumber,
    };
    
    updateEmployeeSchema.parse(dataToValidate);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0]] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Error de validación' } };
  }
};
