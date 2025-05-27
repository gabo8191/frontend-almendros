import { useState } from 'react';
import { Role } from '../../../../auth/types';
import { 
  CreateEmployeeFormData,
  createEmployeeSchema,
  validatePassword,
  getPasswordRequirements,
  formatPhoneNumber
} from '../../../schemas/employee.schema';
import { z } from 'zod';

export const useNewEmployeeForm = () => {
  const [formData, setFormData] = useState<CreateEmployeeFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: Role.SALESPERSON,
    phoneNumber: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: Role.SALESPERSON,
      phoneNumber: '',
      address: '',
    });
    setErrors({});
    setPasswordFocused(false);
  };

  const validateForm = (): boolean => {
    try {
      const dataToValidate = {
        ...formData,
        phoneNumber: formData.phoneNumber ? formatPhoneNumber(formData.phoneNumber) : formData.phoneNumber,
      };
      
      createEmployeeSchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
        return false;
      }
      return false;
    }
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

  const handleInputChange = (field: keyof CreateEmployeeFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const prepareSubmitData = () => {
    const { confirmPassword, ...submitData } = formData;
    
    const cleanData: any = {
      email: submitData.email.trim().toLowerCase(),
      password: submitData.password,
      firstName: submitData.firstName.trim(),
      lastName: submitData.lastName.trim(),
      role: submitData.role,
    };

    if (submitData.phoneNumber && submitData.phoneNumber.trim() !== '') {
      cleanData.phoneNumber = formatPhoneNumber(submitData.phoneNumber.trim());
    }

    if (submitData.address && submitData.address.trim() !== '') {
      cleanData.address = submitData.address.trim();
    }

    return cleanData;
  };

  const handleSubmit = async (
    e: React.FormEvent, 
    onSave: (data: any) => Promise<void>
  ) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const cleanData = prepareSubmitData();
      await onSave(cleanData);
      resetForm();
      return true;
    } catch (error: any) {
      let errorMessage = 'Error al crear el empleado. Por favor, inténtalo de nuevo.';
      
      if (error.response?.data?.details) {
        errorMessage = error.response.data.details.join(', ');
      } else if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('. ');
        } else {
          errorMessage = error.response.data.message;
        }
      }
      
      setErrors({ submit: errorMessage });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordRequirements = getPasswordRequirements();
  const passwordErrors = validatePassword(formData.password);

  return {
    formData,
    errors,
    isSubmitting,
    passwordFocused,
    setPasswordFocused,
    passwordRequirements,
    passwordErrors,
    handlePhoneChange,
    handlePhoneBlur,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
};
