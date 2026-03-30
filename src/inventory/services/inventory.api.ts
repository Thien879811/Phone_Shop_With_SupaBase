import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export interface Inventory {
  id: number;
  productCode: string;
  productName: string;
  category: string;
  brand: string;
  importPrice: number;
  sellPrice: number;
  quantity: number;
  minQuantity: number;
  warehouseLocation: string;
  imei?: string;
  image?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  lowStock?: boolean;
}

export interface InventoryFilter {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  status?: string;
}

export const inventoryApi = {
  getAll: async (filter: InventoryFilter) => {
    const response = await api.get('/inventory', { params: filter });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  create: async (data: Partial<Inventory>) => {
    const response = await api.post('/inventory', data);
    return response.data;
  },

  createBatch: async (data: Partial<Inventory>[]) => {
    const response = await api.post('/inventory/batch', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Inventory>) => {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },

  updateQuantity: async (id: number, quantity: number) => {
    const response = await api.patch(`/inventory/${id}/quantity`, { quantity });
    return response.data;
  }
};
