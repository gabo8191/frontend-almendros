import React, { useState } from 'react';
import { ShoppingCart, Search, Plus, Calendar, User, Eye, RefreshCw } from 'lucide-react';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Spinner from '../../../../shared/components/Spinner';
import Table from '../../../../shared/components/Table';
import NewSaleModal from './NewSaleModal';
import SaleDetailsModal from './SaleDetailsModal';
import { useSales } from './hooks/useSales';
import { useSaleDetails } from './hooks/useSaleDetails';
import { Sale } from '../../api/sale/saleService';

const SalesPage: React.FC = () => {
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);

  const salesData = useSales();
  const saleDetailsData = useSaleDetails();

  const handleSaleCreated = () => {
    setIsNewSaleModalOpen(false);
    salesData.handleRefresh();
  };
  
  const columns: any[] = [
    {
      header: 'ID',
      accessor: 'id',
      sortKey: 'id',
      isSortable: true,
      renderCell: (sale: Sale) => `#${sale.id}`,
      cellClassName: 'text-sm font-medium text-gray-900',
    },
    {
      header: 'Fecha',
      sortKey: 'saleDate',
      isSortable: true,
      renderCell: (sale: Sale) => salesData.formatDate(sale.saleDate),
      cellClassName: 'text-sm text-gray-900',
    },
    {
      header: 'Cliente',
      renderCell: (sale: Sale) => (
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
      ),
    },
    {
      header: 'Total',
      renderCell: (sale: Sale) => salesData.formatCurrency(sale.totalAmount),
      cellClassName: 'text-sm font-semibold text-gray-900',
    },
    {
      header: 'Acciones',
      headerClassName: 'text-center',
      renderCell: (sale: Sale) => (
        <div className="flex justify-center items-center h-full">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye size={16} />}
            onClick={() => saleDetailsData.handleViewDetails(sale.id)}
            disabled={saleDetailsData.isFetchingDetails}
          >
            Ver Detalles
          </Button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (sale: Sale) => (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
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
  );
  
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

  const Pagination = () => {
    if (salesData.totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
            variant="outline"
            size="sm"
            disabled={salesData.currentPage === 1}
            onClick={() => salesData.handlePageChange(salesData.currentPage - 1)}
            >
            Anterior
            </Button>
            {[...Array(Math.min(5, salesData.totalPages))].map((_, i) => {
                const pageNum = salesData.currentPage <= 3 ? i + 1 : salesData.currentPage - 2 + i;
                if (pageNum <= 0 || pageNum > salesData.totalPages) return null;
                return (
                    <Button
                        key={pageNum}
                        variant={pageNum === salesData.currentPage ? undefined : "outline"}
                        size="sm"
                        onClick={() => salesData.handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                    >
                        {pageNum}
                    </Button>
                );
            })}
            <Button
            variant="outline"
            size="sm"
            disabled={salesData.currentPage === salesData.totalPages}
            onClick={() => salesData.handlePageChange(salesData.currentPage + 1)}
            >
            Siguiente
            </Button>
        </div>
    );
  };

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

      <Card>
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

        {salesData.isLoading ? (
          <div className="text-center py-12">
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-4 text-gray-600">Cargando ventas...</p>
          </div>
        ) : salesData.sales.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <Table
              columns={columns}
              data={salesData.sales}
              rowKeyExtractor={(sale) => sale.id}
              currentSortConfig={salesData.sortConfig}
              onSort={salesData.handleSort}
              renderMobileCard={renderMobileCard}
            />
            <Pagination />
          </>
        )}
      </Card>

      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        onSuccess={handleSaleCreated}
      />

      <SaleDetailsModal
        isOpen={saleDetailsData.isModalOpen}
        onClose={saleDetailsData.closeModal}
        saleId={saleDetailsData.selectedSaleId}
        isFetchingDetails={saleDetailsData.isFetchingDetails}
      />
    </div>
  );
};

export default SalesPage;
