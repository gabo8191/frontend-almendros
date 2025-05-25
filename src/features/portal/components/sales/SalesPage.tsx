import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Calendar, User, Eye, RefreshCw } from 'lucide-react';
import { saleService, Sale } from '../../api/saleService';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Spinner from '../../../../shared/components/Spinner';
import { useToast } from '../../../../shared/context/ToastContext';
import NewSaleModal from './NewSaleModal';
import SaleDetailsModal from './SaleDetailsModal';

const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSales, setTotalSales] = useState(0);
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });
  const { showToast } = useToast();

  const fetchSales = async (page = currentPage) => {
    try {
      setIsLoading(true);
      const filters: any = {};
      
      if (dateFilter.startDate) {
        filters.startDate = dateFilter.startDate;
      }
      if (dateFilter.endDate) {
        filters.endDate = dateFilter.endDate;
      }

      const response = await saleService.getSales(page, 10, filters);
      setSales(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalSales(response.meta.total);
      setCurrentPage(response.meta.page);
    } catch (error: any) {
      console.error('Error fetching sales:', error);
      showToast('error', 'Error al cargar las ventas');
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(1);
  }, [dateFilter]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchSales(currentPage);
    }
  }, [currentPage]);

  const handleViewDetails = async (saleId: number) => {
    setIsFetchingDetails(true);
    setIsDetailsModalOpen(true);
    
    try {
      // Get the sale with basic info
      const sale = await saleService.getSaleById(saleId);
      
      // Get the sale details if not included
      if (!sale.details || sale.details.length === 0) {
        const details = await saleService.getSaleDetails(saleId);
        sale.details = details;
      }
      
      setSelectedSale(sale);
    } catch (error: any) {
      console.error('Error fetching sale details:', error);
      showToast('error', 'Error al cargar los detalles de la venta');
      setSelectedSale(null);
      setIsDetailsModalOpen(false);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setSelectedSale(null);
    setIsDetailsModalOpen(false);
    setIsFetchingDetails(false);
  };

  const handleSaleCreated = () => {
    setIsNewSaleModalOpen(false);
    fetchSales(1); // Refresh the sales list and go to first page
    setCurrentPage(1);
    showToast('success', 'Venta registrada exitosamente');
  };

  const handleRefresh = () => {
    fetchSales(currentPage);
  };

  const handleDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateFilter(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setSearchTerm('');
    setCurrentPage(1);
  };

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
    (sale) => {
      const searchLower = searchTerm.toLowerCase();
      
      // Search by sale ID
      if (sale.id.toString().includes(searchTerm)) {
        return true;
      }
      
      // Search by client name
      if (sale.client?.name?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      return false;
    }
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las ventas y transacciones de tu negocio
          </p>
          {totalSales > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Total de ventas: {totalSales}
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button
            variant="outline"
            icon={<RefreshCw size={16} />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Actualizar
          </Button>
          <Button
            icon={<Plus size={16} />}
            onClick={() => setIsNewSaleModalOpen(true)}
          >
            Nueva Venta
          </Button>
        </div>
      </div>

      <Card>
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              icon={<Search size={18} />}
              placeholder="Buscar por ID o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Input
                type="date"
                icon={<Calendar size={18} />}
                placeholder="Fecha inicio"
                value={dateFilter.startDate}
                onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                className="w-full md:w-48"
              />
              <Input
                type="date"
                icon={<Calendar size={18} />}
                placeholder="Fecha fin"
                value={dateFilter.endDate}
                onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                className="w-full md:w-48"
              />
              {(dateFilter.startDate || dateFilter.endDate || searchTerm) && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  size="sm"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-4 text-gray-600">Cargando ventas...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || dateFilter.startDate || dateFilter.endDate
                ? 'No se encontraron ventas'
                : 'No hay ventas registradas'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || dateFilter.startDate || dateFilter.endDate
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza registrando tu primera venta'}
            </p>
            {!(searchTerm || dateFilter.startDate || dateFilter.endDate) && (
              <Button
                icon={<Plus size={16} />}
                onClick={() => setIsNewSaleModalOpen(true)}
              >
                Registrar Primera Venta
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{sale.id}
                      </td>
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
                              {sale.client?.name || 'Cliente no disponible'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye size={16} />}
                          onClick={() => handleViewDetails(sale.id)}
                          disabled={isFetchingDetails}
                        >
                          Ver Detalles
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Venta #{sale.id}</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(sale.totalAmount)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                      {formatDate(sale.saleDate)}
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User size={16} className="text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {sale.client?.name || 'Cliente no disponible'}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Eye size={14} />}
                      onClick={() => handleViewDetails(sale.id)}
                      disabled={isFetchingDetails}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Anterior
                </Button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modals */}
      {isNewSaleModalOpen && (
        <NewSaleModal
          isOpen={isNewSaleModalOpen}
          onClose={() => setIsNewSaleModalOpen(false)}
          onSaleCreated={handleSaleCreated}
        />
      )}

      {isDetailsModalOpen && (
        <SaleDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          sale={selectedSale}
          isLoading={isFetchingDetails}
        />
      )}
    </div>
  );
};

export default SalesPage;