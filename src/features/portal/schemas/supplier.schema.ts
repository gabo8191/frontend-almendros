import { z } from 'zod';
import {
  isValidEmailDomain,
  isTemporaryEmail,
  getRecommendedEmailDomains,
} from '../../../shared/constants/email';
import {
  FIELD_LENGTHS,
  REGEX_PATTERNS,
  DOCUMENT_TYPES,
  ERROR_MESSAGES,
} from '../../../shared/constants/validation';

// Schema para la validación del teléfono internacional (requerido para suppliers)
const phoneSchema = z
  .string()
  .min(1, 'El teléfono es requerido')
  .refine(
    (phone) => {
      if (!phone || phone.trim() === '') return false;
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

// Schema base para crear/actualizar supplier
export const supplierSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre de la empresa es requerido')
    .min(FIELD_LENGTHS.NAME.MIN, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(FIELD_LENGTHS.NAME.MAX, 'El nombre de la empresa no puede exceder 100 caracteres')
    .trim(),
  
  contactName: z
    .string()
    .min(1, 'El nombre del contacto es requerido')
    .min(FIELD_LENGTHS.NAME.MIN, 'El nombre del contacto debe tener al menos 2 caracteres')
    .max(FIELD_LENGTHS.NAME.MAX, 'El nombre del contacto no puede exceder 100 caracteres')
    .trim(),
  
  email: emailSchema,
  
  phoneNumber: phoneSchema,
  
  address: z
    .string()
    .min(1, 'La dirección es requerida')
    .max(FIELD_LENGTHS.ADDRESS.MAX, ERROR_MESSAGES.LENGTH.ADDRESS_MAX)
    .trim(),
  
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
export const updateSupplierSchema = supplierSchema.partial();

// Schema para validación en tiempo real (menos estricto)
export const supplierFormSchema = z.object({
  name: z.string().trim(),
  contactName: z.string().trim(),
  email: z.string().trim(),
  phoneNumber: z.string().trim(),
  address: z.string().trim(),
  documentType: z.string(),
  documentNumber: z.string().trim(),
});

// Tipos derivados de los schemas
export type SupplierFormData = z.infer<typeof supplierFormSchema>;
export type SupplierData = z.infer<typeof supplierSchema>;
export type UpdateSupplierData = z.infer<typeof updateSupplierSchema>;

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
export const validateSupplierForm = (data: SupplierFormData): { 
  isValid: boolean; 
  errors: Record<string, string> 
} => {
  try {
    // Formatear el teléfono antes de validar
    const dataToValidate = {
      ...data,
      phoneNumber: data.phoneNumber ? formatPhoneNumber(data.phoneNumber) : data.phoneNumber,
    };
    
    supplierSchema.parse(dataToValidate);
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
