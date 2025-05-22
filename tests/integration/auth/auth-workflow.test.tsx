import React from 'react';
import { render, screen, waitFor } from '../../utils/render';
import userEvent from '@testing-library/user-event';
import App from '../../../src/App';
import { server } from '../../setup';
import { http, HttpResponse } from 'msw';

describe('Authentication Workflow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('completes full login flow successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'SALESPERSON',
      isActive: true
    };

    server.use(
      http.post('/auth/login', () => {
        return HttpResponse.json({
          token: 'fake-token',
          user: mockUser
        });
      })
    );

    render(<App />, { route: '/login' });

    // Fill in login form
    await userEvent.type(
      screen.getByLabelText(/correo electrónico/i),
      'test@example.com'
    );
    await userEvent.type(
      screen.getByLabelText(/contraseña/i),
      'password123'
    );

    // Submit form
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await userEvent.click(submitButton);

    // Verify redirect to portal
    await waitFor(() => {
      expect(window.location.pathname).toBe('/portal');
    });

    // Verify user is logged in
    expect(await screen.findByText(/bienvenido/i)).toBeInTheDocument();
    expect(screen.getByText(mockUser.firstName)).toBeInTheDocument();
  });

  it('shows error message for invalid credentials', async () => {
    server.use(
      http.post('/auth/login', () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    render(<App />, { route: '/login' });

    await userEvent.type(
      screen.getByLabelText(/correo electrónico/i),
      'wrong@example.com'
    );
    await userEvent.type(
      screen.getByLabelText(/contraseña/i),
      'wrongpassword'
    );

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('redirects to login when accessing protected route while logged out', async () => {
    render(<App />, { route: '/portal' });

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });
});