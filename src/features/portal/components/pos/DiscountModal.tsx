import React, { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { DiscountType } from '../../api/discountService';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (discountData: {
    name: string;
    description: string;
    type: DiscountType;
    value: number;
    startDate: string;
    endDate: string;
    priceId: number;
  }) => Promise<void>;
  priceId: number;
}

const DiscountModal: React.FC<DiscountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  priceId,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PERCENTAGE' as DiscountType,
    value: 0,
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.value <= 0) {
      newErrors.value = 'El valor debe ser mayor a 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ ...formData, priceId });
      onClose();
      setFormData({
        name: '',
        description: '',
        type: 'PERCENTAGE',
        value: 0,
        startDate: '',
        endDate: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Descuento"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Descuento"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <Input
          label="Descripción"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Descuento
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountType })}
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="PERCENTAGE">Porcentaje</option>
            <option value="FIXED_AMOUNT">Monto Fijo</option>
          </select>
        </div>

        <Input
          label={formData.type === 'PERCENTAGE' ? 'Porcentaje' : 'Monto'}
          type="number"
          value={formData.value.toString()}
          onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
          error={errors.value}
          required
        />

        <Input
          label="Fecha de Inicio"
          type="datetime-local"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          error={errors.startDate}
          required
        />

        <Input
          label="Fecha de Fin"
          type="datetime-local"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          error={errors.endDate}
          required
        />

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Crear Descuento
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DiscountModal;