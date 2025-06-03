import React, { useState } from 'react';
import { User, Search, Plus, RefreshCw } from 'lucide-react';
import { User as UserType } from '../../../auth/types';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Spinner from '../../../../shared/components/Spinner';
import EditEmployeeModal from './EditEmployeeModal';
import NewEmployeeModal from './NewEmployeeModal';
import { useEmployees } from './hooks/useEmployees';
import EmployeesTable from './EmployeesTable';

const Employees: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<UserType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const employeesData = useEmployees();

  const handleEditClick = (employee: UserType) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <User size={64} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {employeesData.searchTerm ? 'No se encontraron empleados' : 'No hay empleados registrados'}
      </h3>
      <p className="text-gray-600 mb-6">
        {employeesData.searchTerm
          ? 'Intenta ajustar los términos de búsqueda'
          : 'Comienza agregando tu primer empleado'}
      </p>
      {!employeesData.searchTerm && (
        <Button
          icon={<Plus size={16} />}
          onClick={() => setIsNewModalOpen(true)}
        >
          Crear Primer Empleado
        </Button>
      )}
    </div>
  );

  const renderLoadingState = () => (
    <div className="text-center py-12">
      <Spinner size="lg" className="mx-auto" />
      <p className="mt-4 text-gray-600">Cargando empleados...</p>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Empleados</h1>
          <p className="text-gray-600 mt-1">Administra los empleados del sistema</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button
            variant="outline"
            icon={<RefreshCw size={16} />}
            onClick={employeesData.refreshEmployees}
            disabled={employeesData.isLoading}
          >
            Actualizar
          </Button>
          <Button
            icon={<Plus size={16} />}
            onClick={() => setIsNewModalOpen(true)}
          >
            Nuevo Empleado
          </Button>
        </div>
      </div>

      <Card compact>
        <div className="mb-6">
          <Input
            icon={<Search size={18} />}
            placeholder="Buscar empleados..."
            value={employeesData.searchTerm}
            onChange={(e) => employeesData.setSearchTerm(e.target.value)}
          />
        </div>

        {employeesData.isLoading ? renderLoadingState() :
         employeesData.employees.length === 0 ? renderEmptyState() : (
          <EmployeesTable 
            employees={employeesData.employees}
            processingEmployeeId={employeesData.processingEmployeeId}
            currentPage={employeesData.currentPage}
            totalPages={employeesData.totalPages}
            toggleEmployeeStatus={employeesData.toggleEmployeeStatus}
            handlePageChange={employeesData.handlePageChange}
            onEditClick={handleEditClick}
          />
        )}
      </Card>

      {selectedEmployee && (
        <EditEmployeeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          onSave={async (updatedData) => {
            const success = await employeesData.updateEmployee(selectedEmployee.id, updatedData);
            if (success) {
              setIsEditModalOpen(false);
              setSelectedEmployee(null);
            }
          }}
        />
      )}

      <NewEmployeeModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={async (data) => {
          const success = await employeesData.createEmployee(data);
          if (success) {
            setIsNewModalOpen(false);
          }
        }}
      />
    </div>
  );
};

export default Employees;
