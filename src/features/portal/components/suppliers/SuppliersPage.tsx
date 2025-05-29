import React, { useState, useEffect } from 'react';
import { Truck, Search, Plus, UserX, UserCheck, Edit2 } from 'lucide-react';
import { supplierService, Supplier } from '../../api/supplier/supplierService';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Spinner from '../../../../shared/components/Spinner';
import Table from '../../../../shared/components/Table';
import { useToast } from '../../../../shared/context/ToastContext';
import { useAuth } from '../../../auth/context/AuthContext';
import { Role } from '../../../auth/types';
import NewSupplierModal from './NewSupplierModal';
import EditSupplierModal from './EditSupplierModal';

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMINISTRATOR;

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getSuppliers(currentPage, 10, {
        search: searchTerm || undefined,
      });
      
      // Log the response to see what's actually coming back
      console.log('Supplier response:', response);
      
      // Check if we have valid data and meta properties
      if (response && response.data) {
        setSuppliers(response.data);
      } else {
        setSuppliers([]);
      }
      
      // Safely access totalPages with optional chaining and default value
      setTotalPages(response?.meta?.totalPages || 1);
      
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
      setTotalPages(1);
      showToast('error', 'Error al cargar los proveedores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [currentPage, searchTerm]);

  const handleToggleStatus = async (supplier: Supplier) => {
    try {
      if (supplier.isActive) {
        await supplierService.deactivateSupplier(supplier.id);
        showToast('success', 'Proveedor desactivado exitosamente');
      } else {
        await supplierService.activateSupplier(supplier.id);
        showToast('success', 'Proveedor activado exitosamente');
      }
      await fetchSuppliers();
    } catch (error) {
      console.error('Error toggling supplier status:', error);
      showToast('error', 'Error al cambiar el estado del proveedor');
    }
  };

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const ActionButtons = ({ supplier }: { supplier: Supplier }) => (
    <div className="flex space-x-2">
      <Button variant="ghost" size="sm" icon={<Edit2 size={16}/>} onClick={() => handleEditClick(supplier)}>
        Editar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={supplier.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
        onClick={() => handleToggleStatus(supplier)}
      >
        {supplier.isActive ? 'Desactivar' : 'Activar'}
      </Button>
    </div>
  );

  const columns: any[] = [
    {
      header: 'Proveedor',
      renderCell: (supplier: Supplier) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Truck size={20} className="text-primary-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
            <div className="text-sm text-gray-500">{supplier.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contacto',
      renderCell: (supplier: Supplier) => (
        <div>
          <div className="text-sm text-gray-900">{supplier.contactName}</div>
          <div className="text-sm text-gray-500">{supplier.phoneNumber}</div>
        </div>
      ),
    },
    {
      header: 'Documento',
      renderCell: (supplier: Supplier) => (
        <div>
          <div className="text-sm text-gray-900">{supplier.documentType}</div>
          <div className="text-sm text-gray-500">{supplier.documentNumber}</div>
        </div>
      ),
    },
    {
      header: 'Estado',
      renderCell: (supplier: Supplier) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            supplier.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {supplier.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
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
        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
          <Truck size={20} className="text-primary-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
          <div className="text-xs text-gray-500">{supplier.email}</div>
        </div>
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>
            {supplier.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>
      <div className="text-sm text-gray-700 mb-1">
        <span className="font-medium">Contacto:</span> {supplier.contactName} ({supplier.phoneNumber})
      </div>
      <div className="text-sm text-gray-700 mb-3">
        <span className="font-medium">Documento:</span> {supplier.documentType} {supplier.documentNumber}
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
    return (
        <div className="flex justify-center mt-6 space-x-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                Siguiente
            </Button>
        </div>
    );
  };
  
  const EmptyState = () => (
    <div className="text-center py-8">
        <Truck size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
        No se encontraron proveedores
        </h3>
        <p className="text-gray-600">
        {searchTerm
            ? 'No hay resultados para tu búsqueda'
            : 'Aún no hay proveedores registrados'}
        </p>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Proveedores</h1>
          <p className="text-gray-600 mt-1">Gestiona los proveedores del sistema</p>
        </div>
        {isAdmin && (
          <div className="mt-4 md:mt-0">
            <Button 
              icon={<Plus size={16} />}
              onClick={() => setIsNewModalOpen(true)}
            >
              Nuevo Proveedor
            </Button>
          </div>
        )}
      </div>

      <Card>
        <div className="mb-6">
          <Input
            icon={<Search size={18} />}
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-4 text-gray-600">Cargando proveedores...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <Table 
                columns={columns} 
                data={suppliers} 
                rowKeyExtractor={(supplier) => supplier.id}
                renderMobileCard={renderMobileCard} 
            />
            <Pagination />
          </>
        )}
      </Card>

      <NewSupplierModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={async (supplierData) => {
          try {
            await supplierService.createSupplier(supplierData);
            showToast('success', 'Proveedor creado exitosamente');
            await fetchSuppliers();
            return true;
          } catch (error) {
            console.error('Error creating supplier:', error);
            showToast('error', 'Error al crear el proveedor');
            return false;
          }
        }}
      />

      {selectedSupplier && (
        <EditSupplierModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSupplier(null);
          }}
          supplier={selectedSupplier}
          onSave={async (supplierData) => {
            try {
              await supplierService.updateSupplier(selectedSupplier.id, supplierData);
              showToast('success', 'Proveedor actualizado exitosamente');
              await fetchSuppliers();
              return true;
            } catch (error) {
              console.error('Error updating supplier:', error);
              showToast('error', 'Error al actualizar el proveedor');
              return false;
            }
          }}
        />
      )}
    </div>
  );
};

export default SuppliersPage;