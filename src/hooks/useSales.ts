import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '../services/api';

export const useSales = (params?: any) => {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => salesApi.getAll(params),
  });
};

export const useCreateSales = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => salesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteSales = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: any) => salesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
