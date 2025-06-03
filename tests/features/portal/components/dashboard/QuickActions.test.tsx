/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuickActions from '../../../../../src/features/portal/components/dashboard/QuickActions';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

const defaultProps = {
  onNewSale: vi.fn(),
  isAdmin: false,
};

describe('QuickActions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultProps.onNewSale = vi.fn(); // Reset mock for each test
  });

  it('should render the title and default actions for non-admin', () => {
    render(<QuickActions {...defaultProps} />);
    expect(screen.getByText('Acciones Rápidas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nueva Venta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver Productos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver Ventas/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ver Reportes/i })).not.toBeInTheDocument();
  });

  it('should call onNewSale when "Nueva Venta" button is clicked', () => {
    render(<QuickActions {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Nueva Venta/i }));
    expect(defaultProps.onNewSale).toHaveBeenCalledTimes(1);
  });

  it('should navigate correctly when "Ver Productos" button is clicked', () => {
    render(<QuickActions {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Ver Productos/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/portal/pos');
  });

  it('should navigate correctly when "Ver Ventas" button is clicked', () => {
    render(<QuickActions {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Ver Ventas/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/portal/sales');
  });

  describe('Admin View', () => {
    it('should render "Ver Reportes" button for admin user', () => {
      render(<QuickActions {...defaultProps} isAdmin={true} />);
      expect(screen.getByRole('button', { name: /Ver Reportes/i })).toBeInTheDocument();
    });

    it('should navigate correctly when "Ver Reportes" button is clicked by admin', () => {
      render(<QuickActions {...defaultProps} isAdmin={true} />);
      fireEvent.click(screen.getByRole('button', { name: /Ver Reportes/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/portal/reports');
    });
  });
}); 