import React from 'react';
import Button from '../../../../shared/components/Button';

interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number; // Kept for potential future use, but not used in button rendering if matching ClientsTable
  handlePageChange: (page: number) => void;
}

const ProductsPagination: React.FC<ProductsPaginationProps> = ({
  currentPage,
  totalPages,
  // totalItems, // Not directly used in this specific button layout
  handlePageChange,
}) => {
  if (totalPages <= 1) return null;

  // Logic from ClientsTable.tsx for numbered page buttons
  const pageRange = 5; // Max number of page buttons to show
  let startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
  let endPage = Math.min(totalPages, startPage + pageRange - 1);

  // Adjust startPage if endPage is at the limit and there's space to show more pages at the beginning
  if (endPage === totalPages && totalPages > pageRange) {
    startPage = totalPages - pageRange + 1;
  } else if (endPage < pageRange && totalPages > pageRange) { // Ensure a full range if possible when at the start
    endPage = pageRange;
  }
  // Ensure startPage and endPage are within totalPages bounds, especially for small totalPages
  if (totalPages <= pageRange) {
    startPage = 1;
    endPage = totalPages;
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    if (i > 0) { // Ensure page numbers are positive
        pageNumbers.push(i);
    }
  }

  return (
    // Styling from ClientsTable.tsx pagination container
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

export default ProductsPagination;
