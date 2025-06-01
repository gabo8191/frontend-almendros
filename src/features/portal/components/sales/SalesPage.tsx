import React, { useState } from 'react';
import { ShoppingCart, Search, Plus, Calendar, RefreshCw } from 'lucide-react';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Spinner from '../../../../shared/components/Spinner';
import NewSaleModal from './NewSaleModal';
import SaleDetailsModal from './SaleDetailsModal';
import { useSales } from './hooks/useSales';
import { useSaleDetails } from './hooks/useSaleDetails';
import SalesTable from './SalesTable';

const SalesPage: React.FC = () => {
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);

  const salesData = useSales();
  const saleDetailsData = useSaleDetails();

  const handleSaleCreated = () => {
    setIsNewSaleModalOpen(false);
    salesData.handleRefresh();
  };
  
  const EmptyState = () => (
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
  );

  const renderLoadingState = () => (
    <div className="text-center py-12">
      <Spinner size="lg" className="mx-auto" />
      <p className="mt-4 text-gray-600">Cargando ventas...</p>
    </div>
  );

  return (
    <div className="space-y-6">
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

      <Card compact>
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
        </div>

        {salesData.isLoading ? renderLoadingState() :
         salesData.sales.length === 0 ? <EmptyState /> :
          <SalesTable 
            sales={salesData.sales}
            currentPage={salesData.currentPage}
            totalPages={salesData.totalPages}
            totalSales={salesData.totalSales}
            isFetchingDetails={saleDetailsData.isFetchingDetails}
            currentSortConfig={salesData.sortConfig}
            formatDate={salesData.formatDate}
            formatCurrency={salesData.formatCurrency}
            handlePageChange={salesData.handlePageChange}
            onSort={salesData.handleSort}
            onViewDetails={saleDetailsData.handleViewDetails}
          />
        }
      </Card>

      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        onSuccess={handleSaleCreated}
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
