import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stocksApi, importsApi, suppliersApi } from '../services/api';

export const useStocks = (params?: any) => {
  return useQuery({
    queryKey: ['stocks', params],
    queryFn: () => stocksApi.getSummary(params),
  });
};

export const useMovements = (params?: any) => {
  return useQuery({
    queryKey: ['movements', params],
    queryFn: () => stocksApi.getMovements(params),
  });
};

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => stocksApi.getDashboard(),
  });
};

export const useSuppliers = (params?: any) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => suppliersApi.getAll(params),
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => suppliersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: any; data: any }) => suppliersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: any) => suppliersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useImports = (params?: any) => {
  return useQuery({
    queryKey: ['imports', params],
    queryFn: () => importsApi.getAll(params),
  });
};

export const useCreateImport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => importsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteImport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: any) => importsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
