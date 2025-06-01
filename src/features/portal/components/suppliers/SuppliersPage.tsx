import React, { useState, useEffect } from 'react';
import { Truck, Search, Plus } from 'lucide-react';
import { supplierService, Supplier } from '../../api/supplier/supplierService';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Spinner from '../../../../shared/components/Spinner';
import { useToast } from '../../../../shared/context/ToastContext';
import { useAuth } from '../../../auth/context/AuthContext';
import { Role } from '../../../auth/types';
import NewSupplierModal from './NewSupplierModal';
import EditSupplierModal from './EditSupplierModal';
import SuppliersTable from './SuppliersTable';

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [processingSupplierId, setProcessingSupplierId] = useState<number | string | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMINISTRATOR;

  const fetchSuppliers = async (pageToFetch = currentPage, currentSearchTerm = searchTerm) => {
    setIsLoading(true);
    try {
      const response = await supplierService.getSuppliers(pageToFetch, 10, {
        search: currentSearchTerm || undefined,
      });
      
      if (response && response.data) {
        setSuppliers(response.data);
        setTotalPages(response.meta?.totalPages || 1);
      } else {
        setSuppliers([]);
        setTotalPages(1);
      }
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
    fetchSuppliers(1, searchTerm);
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchSuppliers(currentPage, searchTerm);
  }, [currentPage]);

  const handleToggleStatus = async (supplier: Supplier) => {
    setProcessingSupplierId(supplier.id);
    try {
      if (supplier.isActive) {
        await supplierService.deactivateSupplier(supplier.id);
        showToast('success', 'Proveedor desactivado exitosamente');
      } else {
        await supplierService.activateSupplier(supplier.id);
        showToast('success', 'Proveedor activado exitosamente');
      }
      await fetchSuppliers(currentPage, searchTerm);
    } catch (error) {
      console.error('Error toggling supplier status:', error);
      showToast('error', 'Error al cambiar el estado del proveedor');
    } finally {
      setProcessingSupplierId(null);
    }
  };

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

      <Card compact>
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
          <SuppliersTable
            suppliers={suppliers}
            isAdmin={isAdmin}
            processingSupplierId={processingSupplierId}
            currentPage={currentPage}
            totalPages={totalPages}
            toggleSupplierStatus={handleToggleStatus}
            handlePageChange={handlePageChange}
            onEditClick={handleEditClick}
          />
        )}
      </Card>

      {isNewModalOpen && (
        <NewSupplierModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onSuccess={() => {
            setIsNewModalOpen(false);
            fetchSuppliers(1, '');
            if (currentPage !== 1) setCurrentPage(1);
            if (searchTerm !== '') setSearchTerm('');
          }}
        />
      )}

      {selectedSupplier && isEditModalOpen && (
        <EditSupplierModal
          supplier={selectedSupplier}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSupplier(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedSupplier(null);
            fetchSuppliers(currentPage, searchTerm);
          }}
        />
      )}
    </div>
  );
};

export default SuppliersPage;