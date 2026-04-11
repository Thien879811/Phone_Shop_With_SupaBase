import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Eye, X } from 'lucide-react';
import { type Product } from '../services/api';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useCategories, useBrands } from '../hooks/useProducts';

const formatPrice = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

export const ProductsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 15;

  const { data: productsData, isLoading: loading } = useProducts({ page, limit, search });
  const data = productsData?.data || [];
  const total = productsData?.total || 0;

  const createProductM = useCreateProduct();
  const updateProductM = useUpdateProduct();
  const deleteProductM = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [viewItem, setViewItem] = useState<Product | null>(null);

  const handleSearch = () => { setPage(1); };

  const handleDelete = async (item: Product) => {
    if (!confirm(`Xóa sản phẩm "${item.name}"?`)) return;
    try {
      await deleteProductM.mutateAsync(item.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi xóa sản phẩm');
    }
  };

  const handleSave = async (formData: Partial<Product>) => {
    try {
      if (editItem) {
        await updateProductM.mutateAsync({ id: editItem.id, data: formData });
      } else {
        await createProductM.mutateAsync(formData);
      }
      setShowForm(false);
      setEditItem(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi lưu sản phẩm');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Sản phẩm</h2>
          <p>Quản lý danh mục sản phẩm cửa hàng</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
            <Plus size={16} /> Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Tìm theo tên sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="data-table-filters">
            <button className="btn btn-outline btn-sm" onClick={handleSearch}>Tìm kiếm</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Thương hiệu</th>
                <th>Giá bán</th>
                <th>Tồn thực tế</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <p>Chưa có sản phẩm nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td><span className="cell-main">{item.code}</span></td>
                    <td>
                      <span className="cell-main">{item.name}</span>
                      {item.barcode && <div className="cell-sub">Barcode: {item.barcode}</div>}
                    </td>
                    <td>{item.categoryRel?.name || item.category || '—'}</td>
                    <td>{item.brandRel?.name || item.brand || '—'}</td>
                    <td><span className="price">{formatPrice(item.price)}</span></td>
                    <td style={{ textAlign: 'center' }}>{item.min_stock}</td>
                    <td>
                      <span className={`badge ${item.status === 'ACTIVE' ? 'badge-success' : 'badge-muted'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-icon" title="Xem" onClick={() => setViewItem(item)}>
                          <Eye size={15} />
                        </button>
                        <button className="btn btn-ghost btn-icon" title="Sửa" onClick={() => { setEditItem(item); setShowForm(true); }}>
                          <Pencil size={15} />
                        </button>
                        <button className="btn btn-ghost btn-icon" title="Xóa" onClick={() => handleDelete(item)} style={{ color: 'var(--danger)' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="table-pagination">
            <span>Hiển thị {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total}</span>
            <div className="pagination-btns">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <ProductFormModal
          product={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSave={handleSave}
        />
      )}

      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết sản phẩm</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewItem(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div><label className="form-label">Mã SP</label><p>{viewItem.code}</p></div>
                <div><label className="form-label">Tên</label><p>{viewItem.name}</p></div>
                <div><label className="form-label">Danh mục</label><p>{viewItem.categoryRel?.name || viewItem.category || '—'}</p></div>
                <div><label className="form-label">Thương hiệu</label><p>{viewItem.brandRel?.name || viewItem.brand || '—'}</p></div>
                <div><label className="form-label">Đơn vị</label><p>{viewItem.unit || '—'}</p></div>
                <div><label className="form-label">Giá bán</label><p className="price">{formatPrice(viewItem.price)}</p></div>
                <div><label className="form-label">Tồn tối thiểu</label><p>{viewItem.min_stock}</p></div>
                <div><label className="form-label">Trạng thái</label><span className={`badge ${viewItem.status === 'ACTIVE' ? 'badge-success' : 'badge-muted'}`}>{viewItem.status}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSave }) => {
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const [form, setForm] = useState({
    code: product?.code || '',
    sku: product?.sku || '', // Added sku
    name: product?.name || '',
    category_id: product?.category_id || undefined,
    brand_id: product?.brand_id || undefined,
    unit: product?.unit || 'Cái',
    barcode: product?.barcode || '',
    price: product?.price || 0,
    min_stock: product?.min_stock || 0,
    status: product?.status || 'ACTIVE',
  });


  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Vui lòng nhập Tên sản phẩm');
      return;
    }
    // If not creating NEW product, code should be checked if needed, 
    // but backend handles empty code for new ones anyway.
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Mã sản phẩm</label>
                <input className="form-input" value={form.code} onChange={(e) => handleChange('code', e.target.value)} placeholder="Để trống để tự động sinh mã" />
              </div>
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input className="form-input" value={form.sku} onChange={(e) => handleChange('sku', e.target.value)} placeholder="VD: IP15PM-BLK" required />
              </div>
              <div className="form-group">
                <label className="form-label">Tên sản phẩm *</label>
                <input className="form-input" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="VD: iPhone 15 Pro Max" />
              </div>
              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <select className="form-input" value={form.category_id} onChange={(e) => handleChange('category_id', e.target.value || undefined)}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Thương hiệu</label>
                <select className="form-input" value={form.brand_id} onChange={(e) => handleChange('brand_id', e.target.value || undefined)}>
                  <option value="">-- Chọn nhãn hàng --</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Đơn vị</label>
                <input className="form-input" value={form.unit} onChange={(e) => handleChange('unit', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Barcode</label>
                <input className="form-input" value={form.barcode} onChange={(e) => handleChange('barcode', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Giá bán (VNĐ)</label>
                <input className="form-input" type="number" value={form.price} onChange={(e) => handleChange('price', Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tồn tối thiểu</label>
                <input className="form-input" type="number" value={form.min_stock} onChange={(e) => handleChange('min_stock', Number(e.target.value))} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Trạng thái</label>
                <select className="form-input" value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
                  <option value="ACTIVE">Đang bán</option>
                  <option value="INACTIVE">Ngưng bán</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductsPage;
