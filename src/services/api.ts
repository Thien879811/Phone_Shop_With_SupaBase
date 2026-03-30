import { supabase } from './supabaseClient';

// Helper to mimic axios error response for compatibility
const wrapError = (err: any) => {
  if (err && err.message) {
    return { response: { data: { message: err.message } } };
  }
  return err;
};

export interface Product {
  id: any;
  code: string;
  sku: string; // Added sku as it is mandatory in DB
  name: string;
  category?: string;
  brand?: string;
  category_id?: any;
  brand_id?: any;
  category_id_backup?: any; // To track issues if any
  categoryRel?: Category;
  brandRel?: Brand;
  unit: string;
  barcode: string;
  price: number;
  min_stock: number;
  image: string;
  status: string;
  created_at: string;
}

export const productsApi = {
  getAll: async (params: any = {}) => {
    try {
      const { page = 1, limit = 15, search = '' } = params;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('products')
        .select('*, categoryRel:categories(*), brandRel:brands(*)', { count: 'exact' });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false });
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    } catch (error) {
      throw wrapError(error);
    }
  },
  getById: async (id: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categoryRel:categories(*), brandRel:brands(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  create: async (data: Partial<Product>) => {
    try {
      const { data: result, error } = await supabase.from('products').insert([data]).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  update: async (id: any, data: Partial<Product>) => {
    try {
      const { data: result, error } = await supabase.from('products').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  delete: async (id: any) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw wrapError(error);
    }
  },
};

// ─── SUPPLIERS ────────────────────────────────
export interface Supplier {
  id: any;
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  created_at: string;
}

export const suppliersApi = {
  getAll: async (params: any = {}) => {
    try {
      const { page = 1, limit = 15, search = '' } = params;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase.from('suppliers').select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false });
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    } catch (error) {
      throw wrapError(error);
    }
  },
  getById: async (id: any) => {
    try {
      const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  create: async (data: Partial<Supplier>) => {
    try {
      const { data: result, error } = await supabase.from('suppliers').insert([data]).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  update: async (id: any, data: Partial<Supplier>) => {
    try {
      const { data: result, error } = await supabase.from('suppliers').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  delete: async (id: any) => {
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw wrapError(error);
    }
  },
};

// ─── IMPORT RECEIPTS ─────────────────────────
export interface ImportReceiptItem {
  id?: any;
  product_id: any;
  product_name?: string;
  quantity: number;
  import_price: number;
  total_price?: number;
  imeis?: string[];
}

export interface ImportReceipt {
  id: any;
  code: string;
  supplier_id: any;
  supplier?: Supplier;
  receipt_date: string;
  total_amount: number;
  note: string;
  status: string;
  items: ImportReceiptItem[];
  created_at: string;
}

export const importsApi = {
  getAll: async (params: any = {}) => {
    try {
      const { page = 1, limit = 15 } = params;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await supabase
        .from('import_receipts')
        .select('*, supplier:suppliers(*)', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    } catch (error) {
      throw wrapError(error);
    }
  },
  getById: async (id: any) => {
    try {
      const { data, error } = await supabase
        .from('import_receipts')
        .select('*, supplier:suppliers(*), items:stocks(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  create: async (data: any) => {
    try {
      // Maintaining the business flow logic using RPC if available, or manual orchestration
      const { data: result, error } = await supabase.rpc('create_import_receipt', { data_json: data });
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  delete: async (id: any) => {
    try {
      const { error } = await supabase.from('import_receipts').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw wrapError(error);
    }
  },
};

// ─── STOCKS ──────────────────────────────────
export interface StockSummary {
  product_id: any;
  product_code: string;
  product_name: string;
  category: string;
  brand: string;
  min_stock: number;
  total_remaining: number;
  total_imported: number;
  low_stock: boolean;
}

export interface StockMovement {
  id: any;
  product_id: any;
  product_name: string;
  reference_type: string;
  reference_id: any;
  reference_code: string;
  quantity: number;
  movement_type: string;
  created_at: string;
}

export interface DashboardStats {
  total_products: number;
  total_stock: number;
  low_stock_count: number;
  recent_movements: StockMovement[];
}

export const stocksApi = {
  getSummary: async (params: any = {}) => {
    try {
      const { data, error } = await supabase.rpc('get_stock_summary', { params_json: params });
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  getDashboard: async () => {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  getMovements: async (params: any = {}) => {
    try {
      const { page = 1, limit = 15 } = params;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await supabase
        .from('stock_movements')
        .select('*, product:products(name)', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const mapped = data?.map(m => ({ ...m, productName: m.product?.name })) || [];
      return { data: mapped, total: count || 0 };
    } catch (error) {
      throw wrapError(error);
    }
  },
  getByProduct: async (productId: any) => {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'AVAILABLE');
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
};

// ─── SALES ───────────────────────────────────
export interface SalesInvoiceItem {
  id?: any;
  product_id: any;
  product_name?: string;
  quantity: number;
  price: number;
  total?: number;
  imeis?: string[];
}

export interface SalesInvoice {
  id: any;
  code: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  note: string;
  status: string;
  items: SalesInvoiceItem[];
  created_at: string;
}

export const salesApi = {
  getAll: async (params: any = {}) => {
    try {
      const { page = 1, limit = 15 } = params;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await supabase
        .from('sales_invoices')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    } catch (error) {
      throw wrapError(error);
    }
  },
  getById: async (id: any) => {
    try {
      const { data, error } = await supabase
        .from('sales_invoices')
        .select('*, items:sales_invoice_items(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  create: async (data: any) => {
    try {
      const { data: result, error } = await supabase.rpc('create_sales_invoice', { invoice_json: data });
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  delete: async (id: any) => {
    try {
      const { error } = await supabase.from('sales_invoices').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw wrapError(error);
    }
  },
};

// ─── CATEGORIES ──────────────────────────────
export interface Category {
  id: any;
  name: string;
  prefix: string;
  description: string;
  created_at: string;
}

export const categoriesApi = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw wrapError(error);
    }
  },
  create: async (data: Partial<Category>) => {
    try {
      const { data: result, error } = await supabase.from('categories').insert([data]).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  update: async (id: any, data: Partial<Category>) => {
    try {
      const { data: result, error } = await supabase.from('categories').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  delete: async (id: any) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw wrapError(error);
    }
  },
};

// ─── BRANDS ──────────────────────────────────
export interface Brand {
  id: any;
  name: string;
  origin: string;
  description: string;
  created_at: string;
}

export const brandsApi = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('brands').select('*').order('name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw wrapError(error);
    }
  },
  create: async (data: Partial<Brand>) => {
    try {
      const { data: result, error } = await supabase.from('brands').insert([data]).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  update: async (id: any, data: Partial<Brand>) => {
    try {
      const { data: result, error } = await supabase.from('brands').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  delete: async (id: any) => {
    try {
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw wrapError(error);
    }
  },
};

// ─── REPAIRS ─────────────────────────────────
export interface RepairOrderItem {
  id: any;
  service_id: any;
  service_name: string;
  service_type: 'REPAIR' | 'REPLACEMENT';
  product_id?: any;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
}

export interface RepairOrder {
  id: any;
  code: string;
  customer_id?: any;
  customer_name?: string;
  customer_phone?: string;
  device_name: string;
  imei?: string;
  issue_description?: string;
  received_date: string;
  expected_return_date?: string;
  total_amount: number;
  status: string;
  note?: string;
  items: RepairOrderItem[];
  logs: any[];
  created_at: string;
}

export interface RepairService {
  id: any;
  name: string;
  service_type: 'REPAIR' | 'REPLACEMENT';
  default_price: number;
  product_id?: any;
  description?: string;
  status: string;
  created_at: string;
}

export const repairsApi = {
  getAll: async (params: any = {}) => {
    try {
      const { page = 1, limit = 15 } = params;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await supabase
        .from('repairs')
        .select('*, items:repair_items(*)', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    } catch (error) {
      throw wrapError(error);
    }
  },
  getById: async (id: any) => {
    try {
      const { data, error } = await supabase
        .from('repairs')
        .select('*, items:repair_items(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  create: async (data: any) => {
    try {
      const { data: result, error } = await supabase.from('repairs').insert([data]).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  update: async (id: any, data: any) => {
    try {
      const { data: result, error } = await supabase.from('repairs').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  addService: async (id: any, data: any) => {
    try {
      const { data: result, error } = await supabase.from('repair_items').insert([{ ...data, repair_id: id }]).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  addItem: async (id: any, item: any) => {
    try {
      const { data: result, error } = await supabase.from('repair_items').insert([{ ...item, repair_id: id }]).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  removeItem: async (_id: any, itemId: any) => {
    try {
      const { error } = await supabase.from('repair_items').delete().eq('id', itemId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw wrapError(error);
    }
  },
  complete: async (id: any) => {
    try {
      const { data, error } = await supabase.from('repairs').update({ status: 'COMPLETED' }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  quickImport: async (data: any) => {
    try {
      const { data: result, error } = await supabase.rpc('quick_import_repair', { data_json: data });
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  // Standard Services
  getAllServices: async () => {
    try {
      const { data, error } = await supabase.from('repair_services').select('*').order('name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw wrapError(error);
    }
  },
  createService: async (data: any) => {
    try {
      const { data: result, error } = await supabase.from('repair_services').insert([data]).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  updateService: async (id: any, data: any) => {
    try {
      const { data: result, error } = await supabase.from('repair_services').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  deleteService: async (id: any) => {
    try {
      const { error } = await supabase.from('repair_services').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw wrapError(error);
    }
  },
};

// ─── SOCIAL ACCOUNTS ─────────────────────────
export interface SocialAccount {
  id: any;
  platform: string;
  page_name: string;
  page_id: string;
  access_token: string;
  api_url: string;
  status: string;
  created_at: string;
}

export const socialAccountsApi = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('social_accounts').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw wrapError(error);
    }
  },
  getById: async (id: any) => {
    try {
      const { data, error } = await supabase.from('social_accounts').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  create: async (data: Partial<SocialAccount>) => {
    try {
      const { data: result, error } = await supabase.from('social_accounts').insert([data]).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  update: async (id: any, data: Partial<SocialAccount>) => {
    try {
      const { data: result, error } = await supabase.from('social_accounts').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  delete: async (id: any) => {
    try {
      const { error } = await supabase.from('social_accounts').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw wrapError(error);
    }
  },
  testConnection: async (id: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('test-social-connection', { body: { id } });
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
};

// ─── SOCIAL POSTS ────────────────────────────
export interface PostImage {
  id: any;
  post_id: any;
  image_url: string;
}

export interface PostPlatformStatus {
  id: any;
  post_id: any;
  account_id: any;
  status: string;
  response: string;
  posted_at: string;
  account: SocialAccount;
}

export interface SocialPostItem {
  id: any;
  title: string;
  content: string;
  status: string;
  scheduled_time: string;
  is_repeated: boolean;
  repeat_interval: number;
  created_at: string;
  images: PostImage[];
  platforms: PostPlatformStatus[];
}

export const socialPostsApi = {
  getAll: async (params: any = {}) => {
    try {
      const { page = 1, limit = 15 } = params;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await supabase
        .from('social_posts')
        .select('*, images:post_images(*), platforms:post_platform_status(*, account:social_accounts(*))', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    } catch (error) {
      throw wrapError(error);
    }
  },
  getById: async (id: any) => {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*, images:post_images(*), platforms:post_platform_status(*, account:social_accounts(*))')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  create: async (data: any) => {
    try {
      const { data: result, error } = await supabase.rpc('create_social_post', { post_json: data });
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  update: async (id: any, data: any) => {
    try {
      const { data: result, error } = await supabase.from('social_posts').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    } catch (error) {
      throw wrapError(error);
    }
  },
  delete: async (id: any) => {
    try {
      const { error } = await supabase.from('social_posts').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw wrapError(error);
    }
  },
  publish: async (id: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('publish-post', { body: { id } });
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  retry: async (id: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('retry-post', { body: { id } });
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  repost: async (id: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('repost', { body: { id } });
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  schedule: async (id: any, scheduledTime: string) => {
    try {
      const { data, error } = await supabase.from('social_posts').update({ scheduledTime, status: 'SCHEDULED' }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw wrapError(error);
    }
  },
  uploadImages: async (files: File[]) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage.from('post-images').upload(fileName, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(data.path);
        return { imageUrl: urlData.publicUrl };
      });
      return Promise.all(uploadPromises);
    } catch (error) {
      throw wrapError(error);
    }
  },
};

export default supabase;
