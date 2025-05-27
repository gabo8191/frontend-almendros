import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { loginSchema } from '../schemas/auth.schema';
import { z } from 'zod';

interface LoginForm {
  email: string;
  password: string;
}

type LoginFormErrors = Partial<Record<keyof LoginForm, string[]>>;

export const useLoginForm = () => {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth()
  const navigate = useNavigate();

  /**
   * Validate form data using Zod schema
   */
  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const flattenedErrors = error.flatten();
        setErrors(flattenedErrors.fieldErrors);
      }
      return false;
    }
  };

  /**
   * Handle input field changes and clear field-specific errors
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof LoginForm]) {
      setErrors((prev: LoginFormErrors) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Handle form submission with validation and authentication
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(formData.email, formData.password);
      navigate('/portal');
    } catch (error) {
      // Error handling is managed by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
  };
};
