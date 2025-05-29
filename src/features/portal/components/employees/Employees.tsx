import React, { useState } from 'react';
import { User, Edit2, UserX, UserCheck, Search, Plus, RefreshCw } from 'lucide-react';
import { User as UserType, Role } from '../../../auth/types';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import Spinner from '../../../../shared/components/Spinner';
import Table from '../../../../shared/components/Table';
import EditEmployeeModal from './EditEmployeeModal';
import NewEmployeeModal from './NewEmployeeModal';
import { useEmployees } from './hooks/useEmployees';

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
  
  const columns = [
    {
      header: 'Empleado',
      renderCell: (employee: UserType) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User size={20} className="text-primary-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {employee.firstName} {employee.lastName}
            </div>
            <div className="text-sm text-gray-500">{employee.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Rol',
      renderCell: (employee: UserType) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
          {employee.role === Role.ADMINISTRATOR ? 'Administrador' : 'Vendedor'}
        </span>
      ),
    },
    {
      header: 'Estado',
      renderCell: (employee: UserType) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            employee.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {employee.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      headerClassName: 'text-center',
      renderCell: (employee: UserType) => (
        <div className="flex justify-center items-center h-full">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit2 size={16} />}
              onClick={() => handleEditClick(employee)}
            >
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={employee.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
              onClick={() => employeesData.toggleEmployeeStatus(employee)}
              disabled={employeesData.processingEmployeeId === employee.id}
            >
              {employeesData.processingEmployeeId === employee.id
                ? 'Procesando...'
                : employee.isActive ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </div>
      ),
    },
  ];

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

      <Card>
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
          <>
            <Table
              columns={columns}
              data={employeesData.employees}
              rowKeyExtractor={(employee) => employee.id}
            />
            {employeesData.totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={employeesData.currentPage === 1}
                  onClick={() => employeesData.handlePageChange(employeesData.currentPage - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={employeesData.currentPage === employeesData.totalPages}
                  onClick={() => employeesData.handlePageChange(employeesData.currentPage + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
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
