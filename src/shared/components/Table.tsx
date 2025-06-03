import React from 'react';
import { cn } from '../../utils/cn';

interface ColumnDefinition<T extends Record<string, any>> {
  header: React.ReactNode;
  accessor?: keyof T | string; // To access data, e.g., 'name' or 'client.name'
  renderCell?: (item: T, index: number) => React.ReactNode; // Custom renderer for the cell
  headerClassName?: string;
  cellClassName?: string;
  isSortable?: boolean;
  sortKey?: string; // Key to pass to onSort, usually same as accessor
}

export interface TableProps<T extends Record<string, any>> { // Exporting TableProps for use in other components if needed
  columns: ColumnDefinition<T>[];
  data: T[];
  rowKeyExtractor: (item: T) => string | number; // For React keys, e.g., item => item.id

  currentSortConfig?: { field: string; direction: 'asc' | 'desc' };
  onSort?: (sortKey: string) => void;

  tableClassName?: string; // Overall table classes
  headerContainerClassName?: string; // Class for <thead>
  headerRowClassName?: string; // Class for <tr> in <thead>
  bodyContainerClassName?: string; // Class for <tbody>
  bodyRowClassName?: string | ((item: T, index: number) => string); // Class for <tr> in <tbody>
  
  // For mobile responsiveness - if renderMobileCard is provided, it's used.
  renderMobileCard?: (item: T, index: number) => React.ReactNode;
  mobileCardContainerClassName?: string;
  // Tailwind breakpoint for switching to mobile cards, e.g., 'md' means cards are shown below md.
  // Desktop table will be hidden below this breakpoint, mobile cards shown.
  mobileBreakpoint?: 'sm' | 'md' | 'lg' | 'xl'; 
}

// Helper function to get nested property value
const getNestedValue = (obj: any, path: string): any => {
  if (!path || typeof path !== 'string') return undefined; // Basic check for path validity
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const Table = <T extends Record<string, any>>({
  columns,
  data,
  rowKeyExtractor,
  currentSortConfig,
  onSort,
  tableClassName = 'min-w-full divide-y divide-gray-200',
  headerContainerClassName = '',
  headerRowClassName = 'bg-gray-50',
  bodyContainerClassName = 'bg-white divide-y divide-gray-200',
  bodyRowClassName = 'hover:bg-gray-50',
  renderMobileCard,
  mobileCardContainerClassName = 'space-y-4',
  mobileBreakpoint = 'md', // Default breakpoint for switching
}: TableProps<T>) => {

  const desktopTable = (
    <div className={cn("overflow-x-auto", renderMobileCard ? `${mobileBreakpoint}:block hidden` : 'block')}>
      <table className={cn(tableClassName)}>
        <thead className={cn(headerContainerClassName)}>
          <tr className={cn(headerRowClassName)}>
            {columns.map((col, index) => (
              <th
                key={col.sortKey || (typeof col.accessor === 'string' ? col.accessor : index)}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  col.headerClassName,
                  col.isSortable && onSort && 'cursor-pointer hover:bg-gray-100'
                )}
                onClick={() => col.isSortable && onSort && col.sortKey && onSort(col.sortKey)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.isSortable && currentSortConfig && currentSortConfig.field === col.sortKey && (
                    <span className="text-primary-600">
                      {currentSortConfig.direction === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cn(bodyContainerClassName)}>
          {data.map((item, rowIndex) => (
            <tr
              key={rowKeyExtractor(item)}
              className={cn(
                typeof bodyRowClassName === 'function' ? bodyRowClassName(item, rowIndex) : bodyRowClassName
              )}
            >
              {columns.map((col, colIndex) => (
                <td
                  key={`${rowKeyExtractor(item)}-${col.sortKey || (typeof col.accessor === 'string' ? col.accessor : colIndex)}`}
                  className={cn('px-6 py-4 whitespace-nowrap', col.cellClassName)}
                >
                  {col.renderCell
                    ? col.renderCell(item, rowIndex)
                    : col.accessor ? getNestedValue(item, String(col.accessor)) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const mobileCardsView = renderMobileCard && (
    <div className={cn(mobileCardContainerClassName, `${mobileBreakpoint}:hidden`)}>
      {data.map((item, index) => {
        const mobileCardElement = renderMobileCard(item, index) as React.ReactElement;
        // Ensure a key is passed to the element returned by renderMobileCard
        // It's important that renderMobileCard returns a single root element for React.cloneElement to work correctly.
        return React.isValidElement(mobileCardElement) 
          ? React.cloneElement(mobileCardElement, { key: rowKeyExtractor(item) })
          : mobileCardElement; // Fallback if not a valid element, though it should be
      })}
    </div>
  );

  return (
    <>
      {desktopTable}
      {renderMobileCard && mobileCardsView}
    </>
  );
};

export default Table; 