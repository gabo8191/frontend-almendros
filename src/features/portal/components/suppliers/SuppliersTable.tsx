import React from 'react';
import { Truck, Edit2, UserX, UserCheck } from 'lucide-react'; // Icons for suppliers
import { Supplier } from '../../api/supplier/supplierService'; 
import Button from '../../../../shared/components/Button';
import Table from '../../../../shared/components/Table';

interface SuppliersTableProps {
  suppliers: Supplier[];
  isAdmin: boolean; // To conditionally show action buttons
  processingSupplierId: number | string | null;
  currentPage: number;
  totalPages: number;
  toggleSupplierStatus: (supplier: Supplier) => void;
  handlePageChange: (page: number) => void;
  onEditClick: (supplier: Supplier) => void;
}

const SuppliersTable: React.FC<SuppliersTableProps> = ({
  suppliers,
  isAdmin,
  processingSupplierId,
  currentPage,
  totalPages,
  toggleSupplierStatus,
  handlePageChange,
  onEditClick,
}) => {
  const SupplierAvatar = () => (
    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
      <Truck size={20} className="text-primary-600" />
    </div>
  );

  const StatusBadge = ({ isActive }: { isActive: boolean }) => (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );

  const ActionButtons = ({ supplier }: { supplier: Supplier }) => (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="sm"
        icon={<Edit2 size={16} />}
        onClick={() => onEditClick(supplier)}
      >
        Editar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={supplier.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
        onClick={() => toggleSupplierStatus(supplier)}
        disabled={processingSupplierId === supplier.id}
      >
        {processingSupplierId === supplier.id 
          ? 'Procesando...' 
          : supplier.isActive ? 'Desactivar' : 'Activar'}
      </Button>
    </div>
  );

  const columns: any[] = [
    {
      header: 'Proveedor',
      renderCell: (supplier: Supplier) => (
        <div className="flex items-center">
          <SupplierAvatar />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
            <div className="text-sm text-gray-500">{supplier.email || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contacto',
      renderCell: (supplier: Supplier) => (
        <div>
          <div className="text-sm text-gray-900">{supplier.contactName || 'N/A'}</div>
          <div className="text-sm text-gray-500">{supplier.phoneNumber || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Documento',
      renderCell: (supplier: Supplier) => (
        <div>
          <div className="text-sm text-gray-900">{supplier.documentType || 'N/A'}</div>
          <div className="text-sm text-gray-500">{supplier.documentNumber || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Estado',
      renderCell: (supplier: Supplier) => <StatusBadge isActive={supplier.isActive} />,
    },
  ];

  if (isAdmin) {
    columns.push({
      header: 'Acciones',
      headerClassName: 'text-center',
      renderCell: (supplier: Supplier) => (
        <div className="flex justify-center items-center h-full">
          <ActionButtons supplier={supplier} />
        </div>
      ),
    });
  }

  const renderMobileCard = (supplier: Supplier) => (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-start mb-3">
        <SupplierAvatar />
        <div className="ml-3 flex-1">
          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
          <div className="text-xs text-gray-500 mb-1">{supplier.email || 'N/A'}</div>
          <StatusBadge isActive={supplier.isActive} />
        </div>
      </div>
      <div className="text-sm text-gray-700 mb-1">
        <span className="font-medium">Contacto:</span> {supplier.contactName || 'N/A'} ({supplier.phoneNumber || 'N/A'})
      </div>
      <div className="text-sm text-gray-700 mb-3">
        <span className="font-medium">Documento:</span> {supplier.documentType || 'N/A'} {supplier.documentNumber || 'N/A'}
      </div>
      {isAdmin && (
        <div className="flex justify-center items-center border-t pt-3 mt-3">
          <ActionButtons supplier={supplier} />
        </div>
      )}
    </div>
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageRange = 5;
    let startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
    let endPage = Math.min(totalPages, startPage + pageRange - 1);

    if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - pageRange + 1);
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
          )
        )}
        
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
      <Table<Supplier>
        columns={columns}
        data={suppliers}
        rowKeyExtractor={(supplier) => supplier.id}
        renderMobileCard={renderMobileCard}
      />
      {totalPages > 0 && <Pagination />}
    </>
  );
};

export default SuppliersTable; 