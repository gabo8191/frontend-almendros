/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Reports from '../../../../../src/features/portal/components/reports/Reports';
import { inventoryService } from '../../../../../src/features/portal/api/inventory/inventoryService';
import { inventoryReportService } from '../../../../../src/features/portal/api/inventory/reportService';
import { useToast } from '../../../../../src/shared/context/ToastContext';

// Mock services
vi.mock('../../../../../src/features/portal/api/inventory/inventoryService');
vi.mock('../../../../../src/features/portal/api/inventory/reportService');
vi.mock('../../../../../src/shared/context/ToastContext');

const mockShowToast = vi.fn();
const mockLowStockProductsData = [
  { id: '1', name: 'Product A', currentStock: 3, minQuantity: 5 },
  { id: '2', name: 'Product B', currentStock: 1, minQuantity: 2 },
];

describe('Reports Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast });
    vi.mocked(inventoryService.getStockAlerts).mockResolvedValue({ data: [] }); // Default to no low stock

    // Mock report generation services
    vi.mocked(inventoryReportService.exportInventoryReport).mockResolvedValue(undefined);
    vi.mocked(inventoryReportService.exportSalesReport).mockResolvedValue(undefined);
    vi.mocked(inventoryReportService.exportDetailedSalesReport).mockResolvedValue(undefined);
  });

  const renderComponent = () => render(<Reports />); 

  it('should render initial elements correctly', async () => {
    renderComponent();
    await act(async () => {}); // For useEffect to fetch low stock alerts

    expect(screen.getByText('Reportes')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Inventario')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Excel (.xlsx)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generar Inventario XLSX' })).toBeInTheDocument();
  });

  it('should display low stock alert if products are low', async () => {
    vi.mocked(inventoryService.getStockAlerts).mockResolvedValue({ data: mockLowStockProductsData });
    renderComponent();
    await act(async () => {}); 

    expect(screen.getByText('Productos con Bajo Stock')).toBeInTheDocument();
    expect(screen.getByText(/Product A - Stock actual: 3/)).toBeInTheDocument();
  });

  it('should not display low stock alert if no products are low', async () => {
    renderComponent();
    await act(async () => {});
    expect(screen.queryByText('Productos con Bajo Stock')).not.toBeInTheDocument();
  });

  it('should change report type and show/hide inventory filters section', async () => {
    renderComponent();
    await act(async () => {});

    const reportTypeSelect = screen.getByDisplayValue('Inventario');
    expect(screen.getByLabelText('Aplicar filtros (sin filtros se exportan todos los productos)')).toBeInTheDocument();

    fireEvent.change(reportTypeSelect, { target: { value: 'sales-summary' } });
    expect(screen.queryByLabelText('Aplicar filtros (sin filtros se exportan todos los productos)')).not.toBeInTheDocument();
    
    fireEvent.change(reportTypeSelect, { target: { value: 'inventory' } });
    expect(screen.getByLabelText('Aplicar filtros (sin filtros se exportan todos los productos)')).toBeInTheDocument();
  });

  it('should enable/disable inventory filter inputs when checkbox is toggled', async () => {
    renderComponent();
    await act(async () => {});

    const reportTypeSelect = screen.getByDisplayValue('Inventario');
    fireEvent.change(reportTypeSelect, { target: { value: 'inventory' } });

    const useFiltersCheckbox = screen.getByLabelText('Aplicar filtros (sin filtros se exportan todos los productos)');
    expect(screen.queryByPlaceholderText('ej: 10')).not.toBeInTheDocument(); // Stock Mínimo

    fireEvent.click(useFiltersCheckbox);
    expect(screen.getByPlaceholderText('ej: 10')).toBeInTheDocument(); // Stock Mínimo
    expect(screen.getByPlaceholderText('ej: 100')).toBeInTheDocument(); // Stock Máximo

    fireEvent.click(useFiltersCheckbox); // Disable again
    expect(screen.queryByPlaceholderText('ej: 10')).not.toBeInTheDocument(); // Stock Mínimo
  });

  it('should call exportInventoryReport when generating inventory report (xlsx, no filters)', async () => {
    renderComponent();
    await act(async () => {});

    fireEvent.change(screen.getByDisplayValue('Inventario'), { target: { value: 'inventory' } });
    fireEvent.change(screen.getByDisplayValue('Excel (.xlsx)'), { target: { value: 'xlsx' } });
    
    const generateButton = screen.getByRole('button', { name: 'Generar Inventario XLSX' });
    fireEvent.click(generateButton);

    expect(generateButton).toBeDisabled(); 
    await act(async () => {}); // Wait for promises in handleGenerateReport

    expect(inventoryReportService.exportInventoryReport).toHaveBeenCalledWith('xlsx', undefined);
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Reporte XLSX generado exitosamente');
    expect(generateButton).not.toBeDisabled();
  });

  it('should call exportSalesReport when generating sales summary (pdf)', async () => {
    renderComponent();
    await act(async () => {});

    fireEvent.change(screen.getByDisplayValue('Inventario'), { target: { value: 'sales-summary' } });
    fireEvent.change(screen.getByDisplayValue('Excel (.xlsx)'), { target: { value: 'pdf' } });
    
    const generateButton = screen.getByRole('button', { name: 'Generar Ventas - Resumen PDF' });
    fireEvent.click(generateButton);
    await act(async () => {});

    expect(inventoryReportService.exportSalesReport).toHaveBeenCalledWith('pdf', false);
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Reporte PDF generado exitosamente');
  });

}); 