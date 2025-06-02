import { useState, useEffect, useCallback } from 'react';
import { clientService, Client } from '../../../api/client/clientService';
import { useToast } from '../../../../../shared/context/ToastContext';
import { useAuth } from '../../../../auth/context/AuthContext';
import { Role } from '../../../../auth/types';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [processingClientId, setProcessingClientId] = useState<number | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMINISTRATOR;

  const fetchClientsInternal = useCallback(async (pageToFetch: number, termToSearch: string) => {
    setIsLoading(true);
    const filters: any = {};
    if (termToSearch.trim()) {
      filters.search = termToSearch.trim();
    }
    try {
      const response = await clientService.getClients(pageToFetch, 10, filters);
      setClients(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalClients(response.meta.total);
    } catch (error: any) {
      showToast('error', `Error al cargar los clientes: ${error.response?.data?.message || error.message}`);
      setClients([]);
      setTotalPages(1);
      setTotalClients(0);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchClientsInternal(currentPage, searchTerm);
  }, [currentPage, searchTerm, fetchClientsInternal]);

  useEffect(() => {
    if (hasMounted) {
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    } else {
      setHasMounted(true);
    }
  }, [searchTerm]);

  const toggleClientStatus = async (client: Client) => {
    if (!isAdmin) {
      showToast('error', 'No tienes permisos para cambiar el estado de los clientes');
      return;
    }

    try {
      setProcessingClientId(client.id);
      await clientService.toggleClientStatus(client.id, !client.isActive);
      showToast('success', `Cliente ${client.isActive ? 'desactivado' : 'activado'} exitosamente`);
      fetchClientsInternal(currentPage, searchTerm);
    } catch (error: any) {
      let errorMessage = 'Error al cambiar el estado del cliente';
      
      if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para realizar esta acción. Contacta al administrador.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showToast('error', errorMessage);
    } finally {
      setProcessingClientId(null);
    }
  };

  const updateClient = async (clientId: number, updatedData: any) => {
    try {
      await clientService.updateClient(clientId, updatedData);
      showToast('success', 'Cliente actualizado exitosamente');
      fetchClientsInternal(currentPage, searchTerm);
      return true;
    } catch (error: any) {
      showToast('error', `Error al actualizar el cliente: ${error.response?.data?.message || error.message}`);
      return false;
    }
  };

  const createClient = async (clientData: any) => {
    try {
      await clientService.createClient(clientData);
      showToast('success', 'Cliente creado exitosamente');
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchClientsInternal(1, searchTerm);
      }
      return true;
    } catch (error: any) {
      showToast('error', `Error al crear el cliente: ${error.response?.data?.message || error.message}`);
      return false;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const refreshClients = () => {
    fetchClientsInternal(currentPage, searchTerm);
  };

  return {
    clients,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalClients,
    processingClientId,
    isAdmin,
    toggleClientStatus,
    updateClient,
    createClient,
    handlePageChange,
    refreshClients,
  };
};