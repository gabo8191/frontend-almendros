import React, { useState } from 'react';
import { ShoppingCart, Search, Plus, Calendar, User, Eye, RefreshCw } from 'lucide-react';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Spinner from '../../../../shared/components/Spinner';
import NewSaleModal from './NewSaleModal';
import SaleDetailsModal from './SaleDetailsModal';
import { useSales } from './hooks/useSales';
import { useSaleDetails } from './hooks/useSaleDetails';

const SalesPage: React.FC = () => {
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);

  const salesData = useSales();
  const saleDetailsData = useSaleDetails();

  const handleSaleCreated = () => {
    setIsNewSaleModalOpen(false);
    salesData.handleRefresh();
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
          {salesData.totalSales > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Total de ventas: {salesData.totalSales}
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button
            variant="outline"
            icon={<RefreshCw size={16} />}
            onClick={salesData.handleRefresh}
            disabled={salesData.isLoading}
          >
            Actualizar
          </Button>
          <Button icon={<Plus size={16} />} onClick={() => setIsNewSaleModalOpen(true)}>
            Nueva Venta
          </Button>
        </div>
      </div>

      <Card>
        {/* Filters and Sorting */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              icon={<Search size={18} />}
              placeholder="Buscar por ID o cliente..."
              value={salesData.searchTerm}
              onChange={(e) => salesData.setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Input
                type="date"
                icon={<Calendar size={18} />}
                placeholder="Fecha inicio"
                value={salesData.dateFilter.startDate}
                onChange={(e) => salesData.handleDateFilterChange('startDate', e.target.value)}
                className="w-full md:w-48"
              />
              <Input
                type="date"
                icon={<Calendar size={18} />}
                placeholder="Fecha fin"
                value={salesData.dateFilter.endDate}
                onChange={(e) => salesData.handleDateFilterChange('endDate', e.target.value)}
                className="w-full md:w-48"
              />
              {(salesData.dateFilter.startDate || salesData.dateFilter.endDate || salesData.searchTerm) && (
                <Button variant="outline" onClick={salesData.clearFilters} size="sm">
                  Limpiar
                </Button>
              )}
            </div>
          </div>
          
          {/* Sorting Controls */}
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
            <div className="flex gap-2">
              <Button
                variant={salesData.sortConfig.field === 'saleDate' ? undefined : 'outline'} // ✅ Cambiar 'default' por undefined
                size="sm"
                onClick={() => salesData.handleSort('saleDate')}
                className="flex items-center gap-1"
              >
                Fecha
                {salesData.sortConfig.field === 'saleDate' && (
                  <span className="text-xs">
                    {salesData.sortConfig.direction === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </Button>
              <Button
                variant={salesData.sortConfig.field === 'id' ? undefined : 'outline'} // ✅ Cambiar 'default' por undefined
                size="sm"
                onClick={() => salesData.handleSort('id')}
                className="flex items-center gap-1"
              >
                ID
                {salesData.sortConfig.field === 'id' && (
                  <span className="text-xs">
                    {salesData.sortConfig.direction === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {salesData.isLoading ? (
          <div className="text-center py-12">
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-4 text-gray-600">Cargando ventas...</p>
          </div>
        ) : salesData.sales.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {salesData.searchTerm || salesData.dateFilter.startDate || salesData.dateFilter.endDate
                ? 'No se encontraron ventas'
                : 'No hay ventas registradas'}
            </h3>
            <p className="text-gray-600 mb-6">
              {salesData.searchTerm || salesData.dateFilter.startDate || salesData.dateFilter.endDate
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza registrando tu primera venta'}
            </p>
            {!(salesData.searchTerm || salesData.dateFilter.startDate || salesData.dateFilter.endDate) && (
              <Button icon={<Plus size={16} />} onClick={() => setIsNewSaleModalOpen(true)}>
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
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => salesData.handleSort('id')}
                    >
                      <div className="flex items-center gap-1">
                        ID
                        {salesData.sortConfig.field === 'id' && (
                          <span className="text-primary-600">
                            {salesData.sortConfig.direction === 'desc' ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => salesData.handleSort('saleDate')}
                    >
                      <div className="flex items-center gap-1">
                        Fecha
                        {salesData.sortConfig.field === 'saleDate' && (
                          <span className="text-primary-600">
                            {salesData.sortConfig.direction === 'desc' ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
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
                  {salesData.sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{sale.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {salesData.formatDate(sale.saleDate)}
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
                        {salesData.formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye size={16} />}
                          onClick={() => saleDetailsData.handleViewDetails(sale.id)}
                          disabled={saleDetailsData.isFetchingDetails}
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
              {salesData.sales.map((sale) => (
                <div key={sale.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Venta #{sale.id}</div>
                      <div className="text-lg font-bold text-gray-900">
                        {salesData.formatCurrency(sale.totalAmount)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                      {salesData.formatDate(sale.saleDate)}
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
                      onClick={() => saleDetailsData.handleViewDetails(sale.id)}
                      disabled={saleDetailsData.isFetchingDetails}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {salesData.totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={salesData.currentPage === 1}
                  onClick={() => salesData.handlePageChange(salesData.currentPage - 1)}
                >
                  Anterior
                </Button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, salesData.totalPages))].map((_, i) => {
                    const pageNum = salesData.currentPage <= 3 ? i + 1 : salesData.currentPage - 2 + i;
                    if (pageNum > salesData.totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === salesData.currentPage ? undefined : "outline"} // ✅ Cambiar "default" por undefined
                        size="sm"
                        onClick={() => salesData.handlePageChange(pageNum)}
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
                  disabled={salesData.currentPage === salesData.totalPages}
                  onClick={() => salesData.handlePageChange(salesData.currentPage + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modals */}
      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        onSaleCreated={handleSaleCreated}
      />

      <SaleDetailsModal
        isOpen={saleDetailsData.isDetailsModalOpen}
        onClose={saleDetailsData.handleCloseDetailsModal}
        sale={saleDetailsData.selectedSale}
        isLoading={saleDetailsData.isFetchingDetails}
      />
    </div>
  );
};

export default SalesPage;
