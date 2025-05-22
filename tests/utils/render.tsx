import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/features/auth/context/AuthContext';
import { ToastProvider } from '../../src/shared/context/ToastContext';

function render(ui: React.ReactElement, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  return rtlRender(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export * from '@testing-library/react';
export { render };