import api from '../../../utils/axiosConfig';
import { exportToExcel, exportToPDF, ExportData } from '../../../utils/exportUtils';

export interface InventoryReportData {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  category: string;
  lastMovement: string;
}

export interface SalesReportData {
  saleId: string;
  saleDate: string;
  customerName: string;
  sellerName: string;
  totalAmount: number;
  itemCount: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export const inventoryReportService = {
  // Reportes de Inventario - Solo endpoint paginado
  getInventoryReport: async (filters?: {
    minStock?: number;
    maxStock?: number;
    status?: string;
    search?: string;
  }): Promise<InventoryReportData[]> => {
    try {
      const allInventory: InventoryReportData[] = [];
      let page = 1;
      let hasMorePages = true;
      const limit = 100;

      while (hasMorePages) {
        const params = new URLSearchParams();
        
        if (filters?.minStock) params.append('minStock', filters.minStock.toString());
        if (filters?.maxStock) params.append('maxStock', filters.maxStock.toString());
        if (filters?.status) params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);
        
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await api.get<InventoryReportData[]>(`/inventory-reports/inventory/paginated?${params}`);
        
        // Asegurar que la respuesta sea un array (igual que en ventas)
        let inventoryData: InventoryReportData[] = [];
        if (Array.isArray(response.data)) {
          inventoryData = response.data;
        } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          inventoryData = Array.isArray((response.data as any).data) ? (response.data as any).data : [];
        }
        
        allInventory.push(...inventoryData);
        
        hasMorePages = inventoryData.length === limit;
        page++;
        
        if (page > 50) {
          console.warn('Deteniendo paginación después de 50 páginas');
          break;
        }
      }

      return allInventory;
    } catch (error) {
      console.error('Error getting inventory report:', error);
      throw error;
    }
  },

  // Reportes de Ventas - Usando endpoint full
  getSalesReportFull: async (): Promise<SalesReportData[]> => {
    try {
      const response = await api.get<SalesReportData[]>('/sales/reports/full');
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return Array.isArray((response.data as any).data) ? (response.data as any).data : [];
      } else {
        console.warn('Respuesta inesperada de /sales/reports/full:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error getting full sales report:', error);
      throw error;
    }
  },

  // Reportes de Ventas - Usando endpoint paginado con filtros
  getSalesReportPaginated: async (filters?: {
    startDate?: string;
    endDate?: string;
    productId?: number;
    customerId?: number;
    sellerId?: string;
    groupBy?: 'day' | 'week' | 'month';
    limit?: number;
  }): Promise<SalesReportData[]> => {
    try {
      const allSales: SalesReportData[] = [];
      let page = 1;
      let hasMorePages = true;
      const pageLimit = filters?.limit || 100;

      while (hasMorePages) {
        const params = new URLSearchParams();
        
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.productId) params.append('productId', filters.productId.toString());
        if (filters?.customerId) params.append('customerId', filters.customerId.toString());
        if (filters?.sellerId) params.append('sellerId', filters.sellerId);
        if (filters?.groupBy) params.append('groupBy', filters.groupBy);
        
        params.append('page', page.toString());
        params.append('limit', pageLimit.toString());

        const response = await api.get<SalesReportData[]>(`/sales/reports/paginated?${params}`);
        
        let salesData: SalesReportData[] = [];
        if (Array.isArray(response.data)) {
          salesData = response.data;
        } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          salesData = Array.isArray((response.data as any).data) ? (response.data as any).data : [];
        }
        
        allSales.push(...salesData);
        
        hasMorePages = salesData.length === pageLimit;
        page++;
        
        if (page > 50) {
          console.warn('Deteniendo paginación después de 50 páginas');
          break;
        }
      }

      return allSales;
    } catch (error) {
      console.error('Error getting paginated sales report:', error);
      throw error;
    }
  },

  // Funciones de exportación
  exportInventoryReport: async (format: 'xlsx' | 'pdf', filters?: any) => {
    try {
      const data = await inventoryReportService.getInventoryReport(filters);
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No se encontraron datos para exportar con los filtros seleccionados');
      }
      
      const exportData: ExportData = {
        title: 'Reporte de Inventario',
        filename: `inventario_${new Date().toISOString().split('T')[0]}`, // Corregido: añadido [0]
        headers: ['ID Producto', 'Producto', 'Stock Actual', 'Stock Mínimo', 'Stock Máximo', 'Precio Unitario', 'Valor Total', 'Categoría', 'Último Movimiento'],
        data: data.map(item => [
          item.productId,
          item.productName,
          item.currentStock.toString(),
          item.minStock.toString(),
          item.maxStock.toString(),
          `$${item.unitPrice.toLocaleString('es-CO')}`,
          `$${item.totalValue.toLocaleString('es-CO')}`,
          item.category,
          new Date(item.lastMovement).toLocaleDateString('es-CO')
        ])
      };

      if (format === 'xlsx') {
        exportToExcel(exportData);
      } else {
        exportToPDF(exportData);
      }
    } catch (error) {
      console.error('Error exporting inventory report:', error);
      throw error;
    }
  },

  exportSalesReport: async (format: 'xlsx' | 'pdf', useFilters: boolean = false, filters?: any) => {
    try {
      let data: SalesReportData[];
      
      if (useFilters && filters) {
        data = await inventoryReportService.getSalesReportPaginated(filters);
      } else {
        data = await inventoryReportService.getSalesReportFull();
      }
      
      if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        throw new Error('Error en el formato de datos recibidos');
      }
      
      if (data.length === 0) {
        throw new Error('No se encontraron datos para exportar');
      }
      
      const exportData: ExportData = {
        title: 'Reporte de Ventas - Resumen',
        filename: `ventas_resumen_${new Date().toISOString().split('T')[0]}`,
        headers: ['ID Venta', 'Fecha', 'Cliente', 'Vendedor', 'Total', 'Artículos'],
        data: data.map(item => [
          item.saleId,
          new Date(item.saleDate).toLocaleDateString('es-CO'),
          item.customerName || 'N/A',
          item.sellerName || 'N/A',
          `$${item.totalAmount.toLocaleString('es-CO')}`,
          item.itemCount.toString()
        ])
      };

      if (format === 'xlsx') {
        exportToExcel(exportData);
      } else {
        exportToPDF(exportData);
      }
    } catch (error) {
      console.error('Error exporting sales report:', error);
      throw error;
    }
  },

  exportDetailedSalesReport: async (format: 'xlsx' | 'pdf', useFilters: boolean = false, filters?: any) => {
    try {
      let data: SalesReportData[];
      
      if (useFilters && filters) {
        data = await inventoryReportService.getSalesReportPaginated(filters);
      } else {
        data = await inventoryReportService.getSalesReportFull();
      }
      
      if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        throw new Error('Error en el formato de datos recibidos del servidor');
      }
      
      if (data.length === 0) {
        throw new Error('No se encontraron datos para exportar');
      }
      
      const detailedData: string[][] = [];
      
      data.forEach(sale => {
        if (sale.items && Array.isArray(sale.items) && sale.items.length > 0) {
          sale.items.forEach((item, index) => {
            detailedData.push([
              index === 0 ? sale.saleId : '',
              index === 0 ? new Date(sale.saleDate).toLocaleDateString('es-CO') : '',
              index === 0 ? sale.customerName || 'N/A' : '',
              index === 0 ? sale.sellerName || 'N/A' : '',
              item.productName,
              item.quantity.toString(),
              `$${item.unitPrice.toLocaleString('es-CO')}`,
              `$${item.totalPrice.toLocaleString('es-CO')}`,
              index === 0 ? `$${sale.totalAmount.toLocaleString('es-CO')}` : ''
            ]);
          });
        } else {
          detailedData.push([
            sale.saleId,
            new Date(sale.saleDate).toLocaleDateString('es-CO'),
            sale.customerName || 'N/A',
            sale.sellerName || 'N/A',
            'Sin productos',
            '0',
            '$0',
            '$0',
            `$${sale.totalAmount.toLocaleString('es-CO')}`
          ]);
        }
      });
      
      const exportData: ExportData = {
        title: 'Reporte Detallado de Ventas',
        filename: `ventas_detallado_${new Date().toISOString().split('T')[0]}`,
        headers: [
          'ID Venta', 
          'Fecha', 
          'Cliente', 
          'Vendedor', 
          'Producto', 
          'Cantidad', 
          'Precio Unit.', 
          'Subtotal', 
          'Total Venta'
        ],
        data: detailedData
      };

      if (format === 'xlsx') {
        exportToExcel(exportData);
      } else {
        exportToPDF(exportData);
      }
    } catch (error) {
      console.error('Error exporting detailed sales report:', error);
      throw error;
    }
  }
};
