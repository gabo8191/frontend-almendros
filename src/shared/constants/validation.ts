/**
 * Constantes de validación para formularios
 */

// Longitudes de campos
export const FIELD_LENGTHS = {
    NAME: {
      MIN: 2,
      MAX: 100,
    },
    EMAIL: {
      MAX: 255,
    },
    ADDRESS: {
      MAX: 255,
    },
    DOCUMENT_NUMBER: {
      MIN: 5,
      MAX: 20,
    },
    PHONE: {
      MIN: 8,
      MAX: 15,
    },
  } as const;
  
  // Expresiones regulares
  export const REGEX_PATTERNS = {
    // Formato internacional de teléfono: +[código país][número]
    INTERNATIONAL_PHONE: /^\+[1-9]\d{1,14}$/,
    // Número de documento: solo letras, números y guiones
    DOCUMENT_NUMBER: /^[a-zA-Z0-9-]+$/,
    // Email básico
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  } as const;
  
  // Tipos de documento válidos
  export const DOCUMENT_TYPES = [
    'CC', // Cédula de Ciudadanía
    'CE', // Cédula de Extranjería
    'TI', // Tarjeta de Identidad
    'NIT', // NIT
    'PP', // Pasaporte
  ] as const;
  
  // Mensajes de error estándar
  export const ERROR_MESSAGES = {
    REQUIRED: {
      NAME: 'El nombre es requerido',
      EMAIL: 'El correo electrónico es requerido',
      DOCUMENT_NUMBER: 'El número de documento es requerido',
      DOCUMENT_TYPE: 'El tipo de documento es requerido',
    },
    INVALID: {
      EMAIL: 'Correo electrónico inválido',
      PHONE: 'El teléfono debe estar en formato internacional (ej: +573001234567)',
      DOCUMENT_NUMBER: 'El número de documento solo puede contener letras, números y guiones',
      DOCUMENT_TYPE: 'Tipo de documento inválido',
    },
    LENGTH: {
      NAME_MIN: `El nombre debe tener al menos ${FIELD_LENGTHS.NAME.MIN} caracteres`,
      NAME_MAX: `El nombre no puede exceder ${FIELD_LENGTHS.NAME.MAX} caracteres`,
      EMAIL_MAX: `El correo no puede exceder ${FIELD_LENGTHS.EMAIL.MAX} caracteres`,
      ADDRESS_MAX: `La dirección no puede exceder ${FIELD_LENGTHS.ADDRESS.MAX} caracteres`,
      DOCUMENT_MIN: `El número de documento debe tener al menos ${FIELD_LENGTHS.DOCUMENT_NUMBER.MIN} caracteres`,
      DOCUMENT_MAX: `El número de documento no puede exceder ${FIELD_LENGTHS.DOCUMENT_NUMBER.MAX} caracteres`,
    },
    BUSINESS: {
      TEMPORARY_EMAIL: 'No se permiten correos temporales o desechables. Por favor, usa un correo permanente.',
    },
  } as const;
  
  export type DocumentType = typeof DOCUMENT_TYPES[number];
  