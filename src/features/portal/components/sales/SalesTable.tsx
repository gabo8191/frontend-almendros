import React from 'react';
import { Eye, User, ShoppingCart } from 'lucide-react';
import { Sale } from '../../api/sale/saleService';
import Button from '../../../../shared/components/Button';
import Table from '../../../../shared/components/Table';

interface SalesTableProps {
  sales: Sale[];
  currentPage: number;
  totalPages: number;
  totalSales: number; // For displaying total count if needed, or could be derived
  isFetchingDetails: boolean; // To disable "Ver Detalles" button
  currentSortConfig?: { field: string; direction: 'asc' | 'desc' };
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number) => string;
  handlePageChange: (page: number) => void;
  onSort: (sortKey: string) => void;
  onViewDetails: (saleId: number) => void;
  // No isLoading prop here, parent will handle full page spinner
}

const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  currentPage,
  totalPages,
  isFetchingDetails,
  currentSortConfig,
  formatDate,
  formatCurrency,
  handlePageChange,
  onSort,
  onViewDetails,
}) => {

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
      renderCell: (sale: Sale) => formatDate(sale.saleDate),
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
      renderCell: (sale: Sale) => formatCurrency(sale.totalAmount),
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
            onClick={() => onViewDetails(sale.id)}
            disabled={isFetchingDetails}
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
          onClick={() => onViewDetails(sale.id)}
          disabled={isFetchingDetails}
        >
          Ver Detalles
        </Button>
      </div>
    </div>
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;
    
    const pageRange = 5;
    let startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
    let endPage = Math.min(totalPages, startPage + pageRange - 1);

    if (endPage === totalPages && totalPages > pageRange) {
      startPage = totalPages - pageRange + 1;
    } else if (endPage < pageRange && totalPages > pageRange) {
        endPage = pageRange;
    }
    if (totalPages <= pageRange) {
        startPage = 1;
        endPage = totalPages;
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            >
            Anterior
            </Button>
            {pageNumbers.map((pageNum) => (
                <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? undefined : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                >
                    {pageNum}
                </Button>
            ))}
            <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            >
            Siguiente
            </Button>
        </div>
    );
  };

  return (
    <>
      <Table<Sale>
        columns={columns}
        data={sales}
        rowKeyExtractor={(sale) => sale.id}
        currentSortConfig={currentSortConfig}
        onSort={onSort}
        renderMobileCard={renderMobileCard}
      />
      {totalPages > 0 && <Pagination />}
    </>
  );
};

export default SalesTable; 