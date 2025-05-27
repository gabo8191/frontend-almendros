import { z } from 'zod';
import {
  FIELD_LENGTHS,
  ERROR_MESSAGES,
} from '../../../shared/constants';

// Enums basados en la documentación del API
export const MovementType = z.enum(['ENTRY', 'EXIT']);
export const MovementReason = z.enum([
  'PURCHASE', 
  'SALE', 
  'RETURN', 
  'DAMAGE', 
  'ADJUSTMENT', 
  'INITIAL_STOCK'
]);

// Schema para crear movimiento de inventario (sin status)
export const createInventoryMovementSchema = z.object({
  type: MovementType,
  reason: MovementReason,
  quantity: z
    .number()
    .min(1, 'La cantidad debe ser mayor a 0')
    .max(999999, 'La cantidad no puede exceder 999,999'),
  unitPrice: z
    .number()
    .min(0, 'El precio unitario debe ser mayor o igual a 0')
    .max(999999.99, 'El precio unitario no puede exceder 999,999.99'),
  productId: z
    .number()
    .min(1, 'Debe seleccionar un producto'),
  supplierId: z
    .number()
    .min(1, 'Debe seleccionar un proveedor')
    .optional(),
  saleId: z
    .number()
    .min(1)
    .optional(),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
}).refine(
  (data) => {
    // Para ENTRY, supplierId es SIEMPRE requerido
    if (data.type === 'ENTRY') {
      return data.supplierId !== undefined;
    }
    return true;
  },
  {
    message: 'El proveedor es requerido para todas las entradas de inventario',
    path: ['supplierId'],
  }
);

// Schema para formulario (con strings para inputs)
export const inventoryMovementFormSchema = z.object({
  productId: z.string().min(1, 'Debe seleccionar un producto'),
  supplierId: z.string().optional(),
  saleId: z.string().optional(),
  quantity: z.string().min(1, 'La cantidad es requerida'),
  unitPrice: z.string().min(1, 'El precio unitario es requerido'),
  reason: z.string().min(1, 'La razón es requerida'),
  notes: z.string().optional(),
});

// Tipos derivados
export type CreateInventoryMovementData = z.infer<typeof createInventoryMovementSchema>;
export type InventoryMovementFormData = z.infer<typeof inventoryMovementFormSchema>;
export type MovementTypeEnum = z.infer<typeof MovementType>;
export type MovementReasonEnum = z.infer<typeof MovementReason>;

// Función helper para validar el formulario
export const validateInventoryMovementForm = (
  data: InventoryMovementFormData, 
  type: MovementTypeEnum
): { 
  isValid: boolean; 
  errors: Record<string, string>;
  cleanData?: CreateInventoryMovementData;
} => {
  try {
    // Convertir strings a números y preparar datos
    const quantity = parseFloat(data.quantity);
    const unitPrice = parseFloat(data.unitPrice);
    const productId = parseInt(data.productId);
    const supplierId = data.supplierId ? parseInt(data.supplierId) : undefined;
    const saleId = data.saleId ? parseInt(data.saleId) : undefined;

    // Verificar conversiones
    if (isNaN(quantity) || quantity <= 0) {
      return { isValid: false, errors: { quantity: 'La cantidad debe ser un número mayor a 0' } };
    }
    if (isNaN(unitPrice) || unitPrice < 0) {
      return { isValid: false, errors: { unitPrice: 'El precio unitario debe ser un número mayor o igual a 0' } };
    }
    if (isNaN(productId)) {
      return { isValid: false, errors: { productId: 'Debe seleccionar un producto válido' } };
    }

    // Validación específica: para ENTRY, supplierId es requerido
    if (type === 'ENTRY' && (!data.supplierId || isNaN(parseInt(data.supplierId)))) {
      return { isValid: false, errors: { supplierId: 'El proveedor es requerido para todas las entradas' } };
    }

    const cleanData: CreateInventoryMovementData = {
      type,
      reason: data.reason as MovementReasonEnum,
      quantity,
      unitPrice,
      productId,
      supplierId: type === 'ENTRY' ? parseInt(data.supplierId!) : undefined,
      saleId,
      notes: data.notes?.trim() || undefined,
    };

    createInventoryMovementSchema.parse(cleanData);
    return { isValid: true, errors: {}, cleanData };
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

// Helper para obtener las opciones de razón según el tipo
export const getReasonOptions = (type: MovementTypeEnum): { value: MovementReasonEnum; label: string }[] => {
  if (type === 'ENTRY') {
    return [
      { value: 'PURCHASE', label: 'Compra' },
      { value: 'RETURN', label: 'Devolución' },
      { value: 'ADJUSTMENT', label: 'Ajuste' },
      { value: 'INITIAL_STOCK', label: 'Stock Inicial' },
    ];
  } else {
    return [
      { value: 'SALE', label: 'Venta' },
      { value: 'DAMAGE', label: 'Daño' },
      { value: 'ADJUSTMENT', label: 'Ajuste' },
      { value: 'RETURN', label: 'Devolución' },
    ];
  }
};
