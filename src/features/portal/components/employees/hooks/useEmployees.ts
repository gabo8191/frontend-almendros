import { useState, useEffect } from 'react';
import { employeeService } from '../../../api/employeeService';
import { User as UserType, Role } from '../../../../auth/types';
import { useToast } from '../../../../../shared/context/ToastContext';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingEmployeeId, setProcessingEmployeeId] = useState<string | null>(null);
  
  const { showToast } = useToast();

  const fetchEmployees = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      const response = await employeeService.getEmployees(page);
      setEmployees(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error: any) {
      showToast('error', 'Error al cargar los empleados');
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmployeeStatus = async (employee: UserType) => {
    try {
      setProcessingEmployeeId(employee.id);
      await employeeService.toggleEmployeeStatus(employee.id, !employee.isActive);
      showToast('success', `Usuario ${employee.isActive ? 'desactivado' : 'activado'} exitosamente`);
      fetchEmployees();
    } catch (error: any) {
      showToast('error', 'Error al cambiar el estado del usuario');
    } finally {
      setProcessingEmployeeId(null);
    }
  };

  const updateEmployee = async (employeeId: string, updatedData: any) => {
    try {
      await employeeService.updateEmployee(employeeId, updatedData);
      showToast('success', 'Empleado actualizado exitosamente');
      fetchEmployees();
      return true;
    } catch (error: any) {
      showToast('error', 'Error al actualizar el empleado');
      return false;
    }
  };

  const createEmployee = async (data: {
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
      return true;
    } catch (error: any) {
      if (error.response?.status === 409) {
        showToast('error', 'El correo electrónico ya está registrado');
      } else {
        showToast('error', 'Error al crear el empleado');
      }
      return false;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const refreshEmployees = () => {
    fetchEmployees(currentPage);
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchEmployees();
  }, [currentPage]);

  return {
    employees: filteredEmployees,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    processingEmployeeId,
    toggleEmployeeStatus,
    updateEmployee,
    createEmployee,
    handlePageChange,
    refreshEmployees,
  };
};
