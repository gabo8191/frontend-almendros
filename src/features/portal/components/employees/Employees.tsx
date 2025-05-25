import React, { useState, useEffect } from 'react';
import { User, Edit2, UserX, UserCheck, Search, Plus } from 'lucide-react';
import { employeeService } from '../../api/employeeService';
import { User as UserType, Role } from '../../../auth/types';
import Card from '../../../../shared/components/Card';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { useToast } from '../../../../shared/context/ToastContext';
import EditEmployeeModal from './EditEmployeeModal';
import NewEmployeeModal from './NewEmployeeModal';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<UserType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees(currentPage);
      setEmployees(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      showToast('error', 'Error al cargar los empleados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage]);

  const handleEditClick = (employee: UserType) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async (employee: UserType) => {
    try {
      // This will now use the updated service logic
      await employeeService.toggleEmployeeStatus(employee.id, !employee.isActive);
      showToast('success', `Usuario ${employee.isActive ? 'desactivado' : 'activado'} exitosamente`);
      fetchEmployees(); // Refresh the list
    } catch (error) {
      showToast('error', 'Error al cambiar el estado del usuario');
    }
  };

  const handleCreateEmployee = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    phoneNumber?: string;
    address?: string;
  }) => {
    try {
      await employeeService.createEmployee(data);
      showToast('success', 'Empleado creado exitosamente');
      fetchEmployees();
    } catch (error: any) {
      if (error.response?.status === 409) {
        showToast('error', 'El correo electrónico ya está registrado');
      } else {
        showToast('error', 'Error al crear el empleado');
      }
      throw error;
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Empleados</h1>
          <p className="text-gray-600 mt-1">Administra los empleados del sistema</p>
        </div>
        <div className="mt-4 md:mt-0">
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando empleados...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-8">
            <User size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron empleados
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'No hay resultados para tu búsqueda'
                : 'Aún no hay empleados registrados'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        {employee.role === Role.ADMINISTRATOR ? 'Administrador' : 'Vendedor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {employee.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                          onClick={() => handleToggleStatus(employee)}
                        >
                          {employee.isActive ? 'Desactivar' : 'Activar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
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
            try {
              await employeeService.updateEmployee(selectedEmployee.id, updatedData);
              showToast('success', 'Empleado actualizado exitosamente');
              fetchEmployees();
              setIsEditModalOpen(false);
              setSelectedEmployee(null);
            } catch (error) {
              showToast('error', 'Error al actualizar el empleado');
            }
          }}
        />
      )}

      <NewEmployeeModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleCreateEmployee}
      />
    </div>
  );
};

export default Employees;