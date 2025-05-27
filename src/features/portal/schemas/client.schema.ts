import { z } from 'zod';
import {
  BLOCKED_EMAIL_DOMAINS,
  RECOMMENDED_EMAIL_DOMAINS,
  isValidEmailDomain,
  isTemporaryEmail,
  getRecommendedEmailDomains,
} from '../../../shared/constants/email';
import {
  FIELD_LENGTHS,
  REGEX_PATTERNS,
  DOCUMENT_TYPES,
  ERROR_MESSAGES,
  DocumentType,
} from '../../../shared/constants/validation';

// Schema para la validación del teléfono internacional
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

// Schema base para crear/actualizar cliente
export const clientSchema = z.object({
  name: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED.NAME)
    .min(FIELD_LENGTHS.NAME.MIN, ERROR_MESSAGES.LENGTH.NAME_MIN)
    .max(FIELD_LENGTHS.NAME.MAX, ERROR_MESSAGES.LENGTH.NAME_MAX)
    .trim(),
  
  email: emailSchema,
  
  phoneNumber: phoneSchema,
  
  address: z
    .string()
    .max(FIELD_LENGTHS.ADDRESS.MAX, ERROR_MESSAGES.LENGTH.ADDRESS_MAX)
    .trim()
    .optional(),
  
  documentType: z
    .enum(DOCUMENT_TYPES, {
      errorMap: () => ({ message: ERROR_MESSAGES.INVALID.DOCUMENT_TYPE }),
    }),
  
  documentNumber: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED.DOCUMENT_NUMBER)
    .min(FIELD_LENGTHS.DOCUMENT_NUMBER.MIN, ERROR_MESSAGES.LENGTH.DOCUMENT_MIN)
    .max(FIELD_LENGTHS.DOCUMENT_NUMBER.MAX, ERROR_MESSAGES.LENGTH.DOCUMENT_MAX)
    .trim()
    .refine(
      (docNumber) => REGEX_PATTERNS.DOCUMENT_NUMBER.test(docNumber),
      ERROR_MESSAGES.INVALID.DOCUMENT_NUMBER
    ),
});

// Schema para actualización (todos los campos opcionales excepto los que no se pueden cambiar)
export const updateClientSchema = clientSchema.partial();

// Schema para validación en tiempo real (menos estricto)
export const clientFormSchema = z.object({
  name: z.string().trim(),
  email: z.string().trim(),
  phoneNumber: z.string().trim().optional(),
  address: z.string().trim().optional(),
  documentType: z.string(),
  documentNumber: z.string().trim(),
});

// Tipos derivados de los schemas
export type ClientFormData = z.infer<typeof clientFormSchema>;
export type ClientData = z.infer<typeof clientSchema>;
export type UpdateClientData = z.infer<typeof updateClientSchema>;

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

// Función helper para validar el formulario
export const validateClientForm = (data: ClientFormData): { 
  isValid: boolean; 
  errors: Record<string, string> 
} => {
  try {
    // Formatear el teléfono antes de validar
    const dataToValidate = {
      ...data,
      phoneNumber: data.phoneNumber ? formatPhoneNumber(data.phoneNumber) : data.phoneNumber,
    };
    
    clientSchema.parse(dataToValidate);
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
