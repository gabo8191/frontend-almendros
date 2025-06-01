import React from 'react';
import { User, Edit2, UserX, UserCheck, ShieldQuestion } from 'lucide-react';
import { User as Employee, Role } from '../../../auth/types'; // Assuming User from auth/types is the Employee type
import Button from '../../../../shared/components/Button';
import Table from '../../../../shared/components/Table';

interface EmployeesTableProps {
  employees: Employee[];
  // isAdmin: boolean; // We might not need isAdmin if actions are always present or based on employee role itself
  processingEmployeeId: number | string | null; // User ID can be string or number
  currentPage: number;
  totalPages: number;
  toggleEmployeeStatus: (employee: Employee) => void;
  handlePageChange: (page: number) => void;
  onEditClick: (employee: Employee) => void;
}

const EmployeesTable: React.FC<EmployeesTableProps> = ({
  employees,
  processingEmployeeId,
  currentPage,
  totalPages,
  toggleEmployeeStatus,
  handlePageChange,
  onEditClick,
}) => {
  const EmployeeAvatar = () => (
    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
      <User size={20} className="text-primary-600" />
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

  const RoleDisplay = ({ role }: { role: Role }) => {
    const roleText = role === Role.ADMINISTRATOR ? 'Administrador' : 'Vendedor';
    // Use the exact class string from the old Employees.tsx for consistent styling
    const roleClass = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800";

    return (
      <span className={roleClass}>
        {roleText}
      </span>
    );
  };

  const ActionButtons = ({ employee }: { employee: Employee }) => (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="sm"
        icon={<Edit2 size={16} />}
        onClick={() => onEditClick(employee)}
      >
        Editar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={employee.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
        onClick={() => toggleEmployeeStatus(employee)}
        disabled={processingEmployeeId === employee.id}
      >
        {processingEmployeeId === employee.id 
          ? 'Procesando...' 
          : employee.isActive ? 'Desactivar' : 'Activar'}
      </Button>
    </div>
  );

  const columns: any[] = [
    {
      header: 'Empleado',
      renderCell: (employee: Employee) => (
        <div className="flex items-center">
          <EmployeeAvatar />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{employee.firstName} {employee.lastName}</div>
            <div className="text-sm text-gray-500">{employee.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Rol',
      renderCell: (employee: Employee) => <RoleDisplay role={employee.role} />,
    },
    {
      header: 'Estado',
      renderCell: (employee: Employee) => <StatusBadge isActive={employee.isActive} />,
    },
    {
      header: 'Acciones',
      headerClassName: 'text-center',
      renderCell: (employee: Employee) => (
        <div className="flex justify-center items-center h-full">
          <ActionButtons employee={employee} />
        </div>
      ),
    }
  ];

  const renderMobileCard = (employee: Employee) => (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-start mb-3">
        <EmployeeAvatar />
        <div className="ml-4 flex-1">
          <div className="text-sm font-medium text-gray-900">{employee.firstName} {employee.lastName}</div>
          <div className="text-sm text-gray-500 mb-1">{employee.email}</div>
          <RoleDisplay role={employee.role} /> 
        </div>
        <StatusBadge isActive={employee.isActive} />
      </div>
      
      <div className="flex justify-center items-center pt-3 border-t mt-3">
          <ActionButtons employee={employee} />
      </div>
    </div>
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;

    // Determine the range of page numbers to display
    const pageRange = 5; // Total number of page buttons to show (e.g., 5 means 1 2 3 4 5 or ... 3 4 5 6 7 ...)
    let startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
    let endPage = Math.min(totalPages, startPage + pageRange - 1);

    // Adjust startPage if endPage is at the limit and there's space to show more pages at the beginning
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
      <Table<Employee>
        columns={columns}
        data={employees}
        rowKeyExtractor={(employee) => employee.id}
        renderMobileCard={renderMobileCard}
      />
      {totalPages > 0 && <Pagination />}
    </>
  );
};

export default EmployeesTable; 