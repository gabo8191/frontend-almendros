import React, { useState } from 'react';
import { FileSpreadsheet, Download, AlertTriangle } from 'lucide-react';
import { inventoryService } from '../../api/inventoryService';
import { inventoryReportService, ReportRequest } from '../../api/inventoryReportService';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { useToast } from '../../../../shared/context/ToastContext';

const InventoryReports: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [reportConfig, setReportConfig] = useState<ReportRequest>({
    reportType: 'general',
    format: 'xlsx',
    startDate: '',
    endDate: '',
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
    if (!reportConfig.startDate || !reportConfig.endDate) {
      showToast('error', 'Por favor selecciona un rango de fechas');
      return;
    }

    setIsGenerating(true);
    try {
      const query = await inventoryReportService.getReportQuery(reportConfig);
      const result = await inventoryReportService.executeQuery(query);
      
      // Here you would typically trigger a file download
      // For now, we'll just show a success message
      showToast('success', 'Reporte generado exitosamente');
    } catch (error) {
      console.error('Error generating report:', error);
      showToast('error', 'Error al generar el reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSummaryReport = async () => {
    setIsGenerating(true);
    try {
      const query = await inventoryReportService.getSummaryQuery();
      const result = await inventoryReportService.executeQuery(query);
      showToast('success', 'Reporte resumen generado exitosamente');
    } catch (error) {
      console.error('Error generating summary report:', error);
      showToast('error', 'Error al generar el reporte resumen');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reportes de Inventario</h1>
          <p className="text-gray-600 mt-1">Genera reportes detallados del inventario</p>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="mb-6 bg-amber-50 border-amber-200">
          <div className="flex items-start">
            <AlertTriangle className="text-amber-500 mt-1 mr-3" />
            <div>
              <h3 className="font-medium text-amber-800">Productos con Bajo Stock</h3>
              <ul className="mt-2 space-y-1">
                {lowStockProducts.map((product) => (
                  <li key={product.id} className="text-sm text-amber-700">
                    {product.name} - Stock actual: {product.currentStock} (Mínimo: {product.minQuantity})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Reporte General</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Fecha Inicio"
                value={reportConfig.startDate}
                onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
              />
              <Input
                type="date"
                label="Fecha Fin"
                value={reportConfig.endDate}
                onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Reporte
              </label>
              <select
                value={reportConfig.reportType}
                onChange={(e) => setReportConfig({ ...reportConfig, reportType: e.target.value as 'general' | 'summary' })}
                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="general">Reporte General</option>
                <option value="summary">Reporte Resumen</option>
              </select>
            </div>
            <Button
              fullWidth
              icon={<FileSpreadsheet size={16} />}
              onClick={handleGenerateReport}
              isLoading={isGenerating}
            >
              Generar Reporte
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Reporte Resumen</h2>
          <p className="text-gray-600 mb-4">
            Genera un resumen del estado actual del inventario incluyendo productos críticos y estadísticas generales.
          </p>
          <Button
            fullWidth
            variant="outline"
            icon={<Download size={16} />}
            onClick={handleGenerateSummaryReport}
            isLoading={isGenerating}
          >
            Generar Reporte Resumen
          </Button>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Historial de Reportes</h2>
        <div className="text-center py-6 text-gray-500">
          No hay reportes generados recientemente
        </div>
      </Card>
    </div>
  );
};

export default InventoryReports;