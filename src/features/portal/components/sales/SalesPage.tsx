import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Calendar, User } from 'lucide-react';
import { saleService, Sale } from '../../api/saleService';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { useToast } from '../../../../shared/context/ToastContext';
import NewSaleModal from './NewSaleModal';
import SaleDetailsModal from './SaleDetailsModal';

const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });
  const { showToast } = useToast();

  const fetchSales = async () => {
    try {
      const response = await saleService.getSales(currentPage, 10, {
        startDate: dateFilter.startDate || undefined,
        endDate: dateFilter.endDate || undefined,
      });
      setSales(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      showToast('error', 'Error al cargar las ventas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [currentPage, dateFilter]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  const filteredSales = sales.filter(
    (sale) =>
      sale.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.client?.documentNumber.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ventas</h1>
          <p className="text-gray-600 mt-1">Gestiona las ventas y transacciones</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            icon={<Plus size={16} />}
            onClick={() => setIsNewSaleModalOpen(true)}
          >
            Nueva Venta
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              icon={<Search size={18} />}
              placeholder="Buscar por cliente o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Input
              type="date"
              icon={<Calendar size={18} />}
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="md:w-48"
            />
            <Input
              type="date"
              icon={<Calendar size={18} />}
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="md:w-48"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando ventas...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron ventas
            </h3>
            <p className="text-gray-600">
              {searchTerm || dateFilter.startDate || dateFilter.endDate
                ? 'No hay resultados para tu búsqueda'
                : 'Aún no hay ventas registradas'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(sale.saleDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User size={20} className="text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {sale.client?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Doc: {sale.client?.documentNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSale(sale)}
                      >
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </Card>

      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        onSave={async (saleData) => {
          try {
            await saleService.createSale(saleData);
            showToast('success', 'Venta registrada exitosamente');
            fetchSales();
          } catch (error) {
            showToast('error', 'Error al registrar la venta');
            throw error;
          }
        }}
      />

      {selectedSale && (
        <SaleDetailsModal
          isOpen={!!selectedSale}
          onClose={() => setSelectedSale(null)}
          sale={selectedSale}
        />
      )}
    </div>
  );
};

export default SalesPage;