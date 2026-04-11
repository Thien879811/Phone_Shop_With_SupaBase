import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialAccountsApi, socialPostsApi } from '../services/api';

// Social Accounts
export const useSocialAccounts = () => {
  return useQuery({
    queryKey: ['socialAccounts'],
    queryFn: () => socialAccountsApi.getAll(),
  });
};

export const useCreateSocialAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => socialAccountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
    },
  });
};

export const useUpdateSocialAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => socialAccountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
    },
  });
};

export const useDeleteSocialAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => socialAccountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
    },
  });
};

export const useTestSocialConnection = () => {
  return useMutation({
    mutationFn: (id: number) => socialAccountsApi.testConnection(id),
  });
};

// Social Posts
export const useSocialPosts = (params?: any) => {
  return useQuery({
    queryKey: ['socialPosts', params],
    queryFn: () => socialPostsApi.getAll(params),
  });
};

export const useCreateSocialPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => socialPostsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
    },
  });
};

export const useDeleteSocialPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => socialPostsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
    },
  });
};

export const useSyncSocialPosts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => socialPostsApi.sync(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
    },
  });
};

export const useUpdateSocialPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => socialPostsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
    },
  });
};

export const useSocialPostAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'publish' | 'retry' | 'repost' }) => {
      if (action === 'publish') return socialPostsApi.publish(id);
      if (action === 'retry') return socialPostsApi.retry(id);
      return socialPostsApi.repost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
    },
  });
};
