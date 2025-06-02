/// <reference types="vitest/globals" />
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLoginForm } from '../../../../src/features/auth/hooks/useLoginForm';
import { useAuth } from '../../../../src/features/auth/context/AuthContext';

// Mock dependencies
vi.mock('../../../../src/features/auth/context/AuthContext');
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

const mockLogin = vi.fn();

describe('useLoginForm Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      isAuthenticated: false,
    });
  });

  const mockChangeEvent = (name: string, value: string) => ({
    target: { name, value },
  } as React.ChangeEvent<HTMLInputElement>);

  const mockSubmitEvent = () => ({
    preventDefault: vi.fn(),
  } as unknown as React.FormEvent<HTMLFormElement>);

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useLoginForm());
    expect(result.current.formData).toEqual({ email: '', password: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handleInputChange should update formData and clear errors', () => {
    const { result } = renderHook(() => useLoginForm());

    // Set an initial error
    act(() => {
      result.current.handleSubmit(mockSubmitEvent()); // Trigger validation to set an error
    });
    expect(result.current.errors.email).toBeDefined();

    act(() => {
      result.current.handleInputChange(mockChangeEvent('email', 'test@example.com'));
    });
    expect(result.current.formData.email).toBe('test@example.com');
    expect(result.current.errors.email).toBeUndefined(); // Error should be cleared

    act(() => {
      result.current.handleInputChange(mockChangeEvent('password', 'password123'));
    });
    expect(result.current.formData.password).toBe('password123');
  });

  it('handleSubmit should not call login if validation fails', async () => {
    const { result } = renderHook(() => useLoginForm());
    await act(async () => {
      result.current.handleSubmit(mockSubmitEvent());
    });
    expect(mockLogin).not.toHaveBeenCalled();
    expect(result.current.errors.email).toEqual(['El correo electrónico es requerido', 'Correo electrónico inválido']);
    expect(result.current.errors.password).toEqual(['La contraseña es requerida']);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handleSubmit should set errors for invalid email format', async () => {
    const { result } = renderHook(() => useLoginForm());
    act(() => {
      result.current.handleInputChange(mockChangeEvent('email', 'invalid-email'));
      result.current.handleInputChange(mockChangeEvent('password', 'ValidPass1'));
    });
    await act(async () => {
      result.current.handleSubmit(mockSubmitEvent());
    });
    expect(mockLogin).not.toHaveBeenCalled();
    expect(result.current.errors.email).toEqual(['Correo electrónico inválido']);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handleSubmit should call login and navigate on successful submission', async () => {
    mockLogin.mockResolvedValueOnce(undefined); // Simulate successful login
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.handleInputChange(mockChangeEvent('email', 'test@example.com'));
      result.current.handleInputChange(mockChangeEvent('password', 'Password123'));
    });

    await act(async () => {
      result.current.handleSubmit(mockSubmitEvent());
    });

    expect(result.current.isSubmitting).toBe(false); // Check final state
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123');
    expect(mockNavigate).toHaveBeenCalledWith('/portal');
    expect(result.current.errors).toEqual({});
  });

  it('handleSubmit should handle login failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Login failed'));
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.handleInputChange(mockChangeEvent('email', 'test@example.com'));
      result.current.handleInputChange(mockChangeEvent('password', 'Password123'));
    });

    await act(async () => {
      result.current.handleSubmit(mockSubmitEvent());
    });
    
    expect(result.current.isSubmitting).toBe(false);
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123');
    expect(mockNavigate).not.toHaveBeenCalled(); // Should not navigate on failure
    // Errors from login are handled by AuthContext, so hook's errors object should remain clean if validation passed
    expect(result.current.errors).toEqual({}); 
  });
}); 