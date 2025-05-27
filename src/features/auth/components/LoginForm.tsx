import React from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { useLoginForm } from '../hooks/useLoginForm';

const LoginForm: React.FC = () => {
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit } = useLoginForm();

  return (
    <Card className="w-full max-w-md mx-auto animate-slide-up">
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Volver al inicio
        </Link>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Input
          id="email"
          name="email"
          type="email"
          label="Correo Electrónico"
          placeholder="tu@ejemplo.com"
          value={formData.email}
          onChange={handleInputChange}
          error={Array.isArray(errors.email) ? errors.email[0] : errors.email}
          icon={<Mail size={18} />}
          autoComplete="email"
          required
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleInputChange}
          error={Array.isArray(errors.password) ? errors.password[0] : errors.password}
          icon={<Lock size={18} />}
          autoComplete="current-password"
          required
        />
        
        <div className="flex items-center mb-6 mt-2">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
            Recordarme
          </label>
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          className="transition-all duration-300"
        >
          Iniciar Sesión
        </Button>
      </form>
    </Card>
  );
};

export default LoginForm;
