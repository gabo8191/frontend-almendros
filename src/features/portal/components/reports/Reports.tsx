import React, { useState } from 'react';
import { FileSpreadsheet, AlertTriangle, FileText } from 'lucide-react';
import { inventoryService } from '../../api/inventoryService';
import { inventoryReportService } from '../../api/reportService';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { useToast } from '../../../../shared/context/ToastContext';

const InventoryReports: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [reportConfig, setReportConfig] = useState({
    reportType: 'inventory' as 'inventory' | 'sales-summary' | 'sales-detailed',
    format: 'xlsx' as 'xlsx' | 'pdf',
    useInventoryFilters: false,
    filters: {
      // Filtros de inventario
      minStock: '',
      maxStock: '',
      status: '',
      search: ''
    }
  });
  const { showToast } = useToast();

  const fetchLowStockProducts = async () => {
    try {
      const response = await inventoryService.getStockAlerts();
      setLowStockProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      showToast('error', 'Error al obtener productos con bajo stock');
    }
  };

  React.useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      if (reportConfig.reportType === 'inventory') {
        const filters: any = {};
        
        // Solo aplicar filtros si el usuario los activó
        if (reportConfig.useInventoryFilters) {
          if (reportConfig.filters.minStock) filters.minStock = parseInt(reportConfig.filters.minStock);
          if (reportConfig.filters.maxStock) filters.maxStock = parseInt(reportConfig.filters.maxStock);
          if (reportConfig.filters.status) filters.status = reportConfig.filters.status;
          if (reportConfig.filters.search) filters.search = reportConfig.filters.search;
        }
        
        await inventoryReportService.exportInventoryReport(
          reportConfig.format, 
          reportConfig.useInventoryFilters ? filters : undefined
        );
      
      } else if (reportConfig.reportType === 'sales-summary') {
        // Sin filtros, que se jodan jejeje
        await inventoryReportService.exportSalesReport(reportConfig.format, false);
      
      } else if (reportConfig.reportType === 'sales-detailed') {
        // Sin filtros también
        await inventoryReportService.exportDetailedSalesReport(reportConfig.format, false);
      }
      
      showToast('success', `Reporte ${reportConfig.format.toUpperCase()} generado exitosamente`);
    } catch (error) {
      console.error('Error generating report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al generar el reporte';
      showToast('error', errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportTypeLabel = () => {
    switch (reportConfig.reportType) {
      case 'inventory': return 'Inventario';
      case 'sales-summary': return 'Ventas - Resumen';
      case 'sales-detailed': return 'Ventas - Detallado';
      default: return 'Reporte';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-1">Genera reportes de inventario y ventas</p>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="mb-6 bg-amber-50 border-amber-200">
          <div className="flex items-start">
            <AlertTriangle className="text-amber-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Productos con Bajo Stock</h3>
              <ul className="mt-2 space-y-1">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <li key={product.id} className="text-sm text-amber-700">
                    {product.name} - Stock actual: {product.currentStock} (Mínimo: {product.minQuantity})
                  </li>
                ))}
                {lowStockProducts.length > 5 && (
                  <li className="text-sm text-amber-600 font-medium">
                    ... y {lowStockProducts.length - 5} productos más
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Generar Reporte</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Reporte
                </label>
                <select
                  value={reportConfig.reportType}
                  onChange={(e) => setReportConfig({ 
                    ...reportConfig, 
                    reportType: e.target.value as 'inventory' | 'sales-summary' | 'sales-detailed',
                    useInventoryFilters: false,
                    filters: {
                      minStock: '',
                      maxStock: '',
                      status: '',
                      search: ''
                    }
                  })}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="inventory">Inventario</option>
                  <option value="sales-summary">Ventas - Resumen</option>
                  <option value="sales-detailed">Ventas - Detallado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formato
                </label>
                <select
                  value={reportConfig.format}
                  onChange={(e) => setReportConfig({ 
                    ...reportConfig, 
                    format: e.target.value as 'xlsx' | 'pdf' 
                  })}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="pdf">PDF (.pdf)</option>
                </select>
              </div>
            </div>

            {/* Checkbox para filtros de inventario */}
            {reportConfig.reportType === 'inventory' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useInventoryFilters"
                  checked={reportConfig.useInventoryFilters}
                  onChange={(e) => setReportConfig({ 
                    ...reportConfig, 
                    useInventoryFilters: e.target.checked 
                  })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="useInventoryFilters" className="ml-2 text-sm text-gray-700">
                  Aplicar filtros (sin filtros se exportan todos los productos)
                </label>
              </div>
            )}

            {/* Filtros de inventario - solo si están activados */}
            {reportConfig.reportType === 'inventory' && reportConfig.useInventoryFilters && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700">Filtros de Inventario</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    label="Stock Mínimo"
                    placeholder="ej: 10"
                    value={reportConfig.filters.minStock}
                    onChange={(e) => setReportConfig({ 
                      ...reportConfig, 
                      filters: { ...reportConfig.filters, minStock: e.target.value }
                    })}
                  />
                  <Input
                    type="number"
                    label="Stock Máximo"
                    placeholder="ej: 100"
                    value={reportConfig.filters.maxStock}
                    onChange={(e) => setReportConfig({ 
                      ...reportConfig, 
                      filters: { ...reportConfig.filters, maxStock: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado del Producto
                  </label>
                  <select
                    value={reportConfig.filters.status}
                    onChange={(e) => setReportConfig({ 
                      ...reportConfig, 
                      filters: { ...reportConfig.filters, status: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Todos los estados</option>
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                  </select>
                </div>
                <Input
                  type="text"
                  label="Buscar Producto"
                  placeholder="Nombre o descripción del producto"
                  value={reportConfig.filters.search}
                  onChange={(e) => setReportConfig({ 
                    ...reportConfig, 
                    filters: { ...reportConfig.filters, search: e.target.value }
                  })}
                />
              </div>
            )}

            {/* Información para ventas - sin filtros */}
            {(reportConfig.reportType === 'sales-summary' || reportConfig.reportType === 'sales-detailed') && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>📊 Reporte completo:</strong> Se exportarán todas las ventas disponibles en el sistema.
                </p>
              </div>
            )}

            <Button
              fullWidth
              icon={reportConfig.format === 'xlsx' ? <FileSpreadsheet size={16} /> : <FileText size={16} />}
              onClick={handleGenerateReport}
              isLoading={isGenerating}
            >
              {isGenerating ? 'Generando...' : `Generar ${getReportTypeLabel()} ${reportConfig.format.toUpperCase()}`}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">📊 Reportes de Inventario</h3>
              <p className="text-sm text-green-700">
                Stock actual, valores, categorías y últimos movimientos. 
                <strong> Filtros opcionales</strong> por stock, estado y búsqueda.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">📈 Ventas - Resumen</h3>
              <p className="text-sm text-blue-700">
                Información general de cada venta: fecha, cliente, vendedor, total y cantidad de artículos.
                <strong> Exporta todas las ventas.</strong>
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">🔍 Ventas - Detallado</h3>
              <p className="text-sm text-purple-700">
                Desglose completo incluyendo cada producto vendido con cantidades y precios individuales.
                <strong> Exporta todas las ventas.</strong>
              </p>
            </div>
          </div>
        </Card>

        {/* Tarjeta de estadísticas rápidas */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Información Adicional</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-medium text-indigo-800 mb-2">⚡ Reportes Rápidos</h3>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Inventario sin filtros: Todos los productos</li>
                <li>• Ventas: Siempre exporta todo completo</li>
                <li>• Formatos: Excel para análisis, PDF para presentación</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">🎯 Casos de Uso</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Auditoría:</strong> Inventario completo sin filtros</li>
                <li>• <strong>Stock crítico:</strong> Filtrar por stock mínimo</li>
                <li>• <strong>Análisis ventas:</strong> Reporte detallado completo</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InventoryReports;
