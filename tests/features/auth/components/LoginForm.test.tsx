/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from '../../../../src/features/auth/components/LoginForm';
import { useLoginForm } from '../../../../src/features/auth/hooks/useLoginForm';
import { MemoryRouter } from 'react-router-dom'; // Needed for <Link>

// Mock the hook
vi.mock('../../../../src/features/auth/hooks/useLoginForm');

// Mock shared components (optional, but can simplify tests)
vi.mock('../../../../src/shared/components/Input', () => ({
  default: vi.fn(({ label, value, onChange, error, icon, ...rest }) => (
    <div>
      <label htmlFor={rest.id}>{label}</label>
      <input id={rest.id} value={value} onChange={onChange} {...rest} />
      {icon}
      {error && <p role="alert" className="error-message">{error}</p>}
    </div>
  )),
}));

vi.mock('../../../../src/shared/components/Button', () => ({
  default: vi.fn(({ children, isLoading, ...rest }) => (
    <button {...rest}>{isLoading ? 'Loading...' : children}</button>
  )),
}));

const mockUseLoginFormReturn = {
  formData: { email: '', password: '' },
  errors: {},
  isSubmitting: false,
  handleInputChange: vi.fn(),
  handleSubmit: vi.fn(),
};

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock return value for each test for isolation
    mockUseLoginFormReturn.formData = { email: '', password: '' };
    mockUseLoginFormReturn.errors = {};
    mockUseLoginFormReturn.isSubmitting = false;
    mockUseLoginFormReturn.handleInputChange = vi.fn();
    mockUseLoginFormReturn.handleSubmit = vi.fn();
    vi.mocked(useLoginForm).mockReturnValue(mockUseLoginFormReturn);
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('should render inputs, submit button, and back link', () => {
    renderWithRouter(<LoginForm />);
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver al inicio/i })).toBeInTheDocument();
  });

  it('should call handleInputChange when typing in email field', () => {
    renderWithRouter(<LoginForm />);
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(mockUseLoginFormReturn.handleInputChange).toHaveBeenCalledTimes(1);
    // More specific check if needed: expect(mockUseLoginFormReturn.handleInputChange).toHaveBeenCalledWith(expect.objectContaining({ target: { name: 'email', value: 'test@example.com' } }));
  });

  it('should call handleInputChange when typing in password field', () => {
    renderWithRouter(<LoginForm />);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(mockUseLoginFormReturn.handleInputChange).toHaveBeenCalledTimes(1);
  });

  it('should call handleSubmit when form is submitted', () => {
    renderWithRouter(<LoginForm />);
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
    fireEvent.submit(submitButton);
    expect(mockUseLoginFormReturn.handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('should display email error when provided by useLoginForm', () => {
    vi.mocked(useLoginForm).mockReturnValue({
      ...mockUseLoginFormReturn,
      errors: { email: ['Invalid email format'] },
    });
    renderWithRouter(<LoginForm />);
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email format');
  });

  it('should display password error when provided by useLoginForm', () => {
    vi.mocked(useLoginForm).mockReturnValue({
      ...mockUseLoginFormReturn,
      errors: { password: ['Password is too short'] },
    });
    renderWithRouter(<LoginForm />);
    expect(screen.getByText('Password is too short')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Password is too short');
  });

  it('should show loading state on submit button when isSubmitting is true', () => {
    vi.mocked(useLoginForm).mockReturnValue({
      ...mockUseLoginFormReturn,
      isSubmitting: true,
    });
    renderWithRouter(<LoginForm />);
    expect(screen.getByRole('button', { name: /Loading.../i })).toBeInTheDocument();
  });
}); 