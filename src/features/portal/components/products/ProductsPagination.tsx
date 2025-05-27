import React from 'react';
import Button from '../../../../shared/components/Button';

interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  handlePageChange: (page: number) => void;
}

const ProductsPagination: React.FC<ProductsPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  handlePageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 pt-6 border-t space-y-3 sm:space-y-0">
      <div className="text-sm text-gray-500 text-center sm:text-left">
        Página {currentPage} de {totalPages} ({totalItems} productos)
      </div>
      <div className="flex justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Anterior
        </Button>
        <span className="flex items-center px-3 py-1 text-sm text-gray-600">
          {currentPage}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};

export default ProductsPagination;
