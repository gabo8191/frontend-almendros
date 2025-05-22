import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../utils/render';
import { useAuth } from '../../../../../src/features/auth/context/AuthContext';
import LoginForm from '../../../../../src/features/auth/components/LoginForm';
import userEvent from '@testing-library/user-event';

// Mock useAuth hook
jest.mock('../../../../../src/features/auth/context/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows validation errors for invalid email', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.click(submitButton);

    expect(await screen.findByText(/correo electrónico inválido/i)).toBeInTheDocument();
  });

  it('shows loading state during submission', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(() => new Promise(resolve => setTimeout(resolve, 100))),
      isLoading: true
    });

    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});