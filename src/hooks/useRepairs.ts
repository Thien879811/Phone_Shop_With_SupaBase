import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repairsApi } from '../services/api';

export const useRepairs = (params?: any) => {
  return useQuery({
    queryKey: ['repairs', params],
    queryFn: () => repairsApi.getAll(params),
  });
};

export const useRepairById = (id: any) => {
  return useQuery({
    queryKey: ['repairs', id],
    queryFn: () => repairsApi.getById(id),
    enabled: !!id,
  });
};

export const useRepairServices = () => {
  return useQuery({
    queryKey: ['repairServices'],
    queryFn: () => repairsApi.getAllServices(),
  });
};

export const useCreateRepair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => repairsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateRepair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: any; data: any }) => repairsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
    },
  });
};

export const useDeleteRepair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: any) => repairsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useCompleteRepair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: any) => repairsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useCreateRepairService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => repairsApi.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairServices'] });
    },
  });
};

export const useUpdateRepairService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: any; data: any }) => repairsApi.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairServices'] });
    },
  });
};

export const useDeleteRepairService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: any) => repairsApi.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairServices'] });
    },
  });
};

export const useAddRepairService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: any; data: any }) => repairsApi.addService(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      queryClient.invalidateQueries({ queryKey: ['repairs', variables.id] });
    },
  });
};

export const useRemoveRepairItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: any; itemId: any }) => repairsApi.removeItem(orderId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      queryClient.invalidateQueries({ queryKey: ['repairs', variables.orderId] });
    },
  });
};

export const useQuickImport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => repairsApi.quickImport(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      if (variables.repair_order_id) {
        queryClient.invalidateQueries({ queryKey: ['repairs', variables.repair_order_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
