import { useState, useEffect } from 'react';
import { User as UserType } from '../../../../auth/types';
import { 
  UpdateEmployeeFormData, 
  validateEditEmployeeForm, 
  formatPhoneNumber 
} from '../../../schemas/employee.schema';

export const useEditEmployeeForm = (employee: UserType) => {
  const [formData, setFormData] = useState<UpdateEmployeeFormData>({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phoneNumber: employee.phoneNumber || '',
    address: employee.address || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when employee prop changes
  useEffect(() => {
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber || '',
      address: employee.address || '',
    });
    setErrors({});
  }, [employee]);

  const validateForm = (): boolean => {
    const validation = validateEditEmployeeForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, phoneNumber: value });
    
    if (errors.phoneNumber) {
      setErrors({ ...errors, phoneNumber: '' });
    }
  };

  const handlePhoneBlur = () => {
    if (formData.phoneNumber && !formData.phoneNumber.startsWith('+')) {
      const formatted = formatPhoneNumber(formData.phoneNumber);
      setFormData({ ...formData, phoneNumber: formatted });
    }
  };

  const handleInputChange = (field: keyof UpdateEmployeeFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const prepareSubmitData = () => {
    return {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phoneNumber: formData.phoneNumber ? formatPhoneNumber(formData.phoneNumber) : '',
      address: formData.address?.trim() || '',
    };
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSave: (data: any) => Promise<void>
  ) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    
    try {
      const finalData = prepareSubmitData();
      await onSave(finalData);
      return true;
    } catch (error: any) {
      let errorMessage = 'Error al actualizar el empleado. Por favor, inténtalo de nuevo.';
      
      if (error.response?.data?.details) {
        errorMessage = error.response.data.details.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrors({ submit: errorMessage });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handlePhoneChange,
    handlePhoneBlur,
    handleInputChange,
    handleSubmit,
  };
};
