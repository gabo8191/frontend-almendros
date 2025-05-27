import { useState, useEffect } from 'react';
import { saleService, Sale } from '../../../api/sale/saleService';
import { useToast } from '../../../../../shared/context/ToastContext';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSales, setTotalSales] = useState(0);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'saleDate',
    direction: 'desc'
  });

  const { showToast } = useToast();

  const fetchSales = async (page = currentPage) => {
    try {
      setIsLoading(true);
      const filters: any = {};
      
      if (dateFilter.startDate) {
        filters.startDate = dateFilter.startDate;
      }
      if (dateFilter.endDate) {
        filters.endDate = dateFilter.endDate;
      }

      const response = await saleService.getSales(page, 10, filters);
      setSales(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalSales(response.meta.total);
      setCurrentPage(response.meta.page);
    } catch (error: any) {
      showToast('error', 'Error al cargar las ventas');
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSales(currentPage);
  };

  const handleDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateFilter(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const sortSales = (sales: Sale[], config: { field: string; direction: string }) => {
    if (!config.field) return sales;

    const sortedSales = [...sales].sort((a, b) => {
      let valueA: any, valueB: any;

      if (config.field === 'saleDate') {
        valueA = new Date(a.saleDate);
        valueB = new Date(b.saleDate);
      } else if (config.field === 'id') {
        valueA = a.id;
        valueB = b.id;
      }

      if (config.direction === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });

    return sortedSales;
  };

  const handleSort = (field: string) => {
    setSortConfig(prevConfig => ({
      field: field,
      direction: prevConfig.field === field && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  const filteredAndSortedSales = sortSales(
    sales.filter((sale) => {
      const searchLower = searchTerm.toLowerCase();
      
      if (sale.id.toString().includes(searchTerm)) {
        return true;
      }
      
      if (sale.client?.name?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      return false;
    }),
    sortConfig
  );

  useEffect(() => {
    fetchSales(1);
  }, [dateFilter]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchSales(currentPage);
    }
  }, [currentPage]);

  return {
    sales: filteredAndSortedSales,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalSales,
    dateFilter,
    sortConfig,
    handleRefresh,
    handleDateFilterChange,
    clearFilters,
    handleSort,
    handlePageChange,
    formatDate,
    formatCurrency,
  };
};
