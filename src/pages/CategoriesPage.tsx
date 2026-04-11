import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Tags } from 'lucide-react';
import { categoriesApi, type Category } from '../services/api';

export const CategoriesPage: React.FC = () => {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await categoriesApi.getAll();
      setData(res);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async (formData: Partial<Category>) => {
    try {
      if (editItem) {
        await categoriesApi.update(editItem.id, formData);
      } else {
        await categoriesApi.create(formData);
      }
      setShowForm(false);
      setEditItem(null);
      loadData();
    } catch (err: any) { alert('Lỗi: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa danh mục này?')) return;
    try {
      await categoriesApi.delete(id);
      loadData();
    } catch (err: any) { alert('Không thể xóa vì đã có sản phẩm thuộc danh mục này.'); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Danh mục</h2>
          <p>Quản lý phân loại sản phẩm</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
            <Plus size={16} /> Thêm danh mục
          </button>
        </div>
      </div>

      <div className="data-table-wrapper">
        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Tiền tố (Mã)</th>
                <th>Mô tả</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><Tags size={40} /><p>Chưa có danh mục nào</p></div></td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td><span className="cell-main">{item.name}</span></td>
                    <td><span className="badge badge-info">{item.prefix || '—'}</span></td>
                    <td>{item.description || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => { setEditItem(item); setShowForm(true); }}><Pencil size={15} /></button>
                        <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(item.id)} style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <CategoryFormModal
          item={editItem}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

const CategoryFormModal: React.FC<{ item: Category | null; onClose: () => void; onSave: (d: any) => void }> = ({ item, onClose, onSave }) => {
  const [name, setName] = useState(item?.name || '');
  const [prefix, setPrefix] = useState(item?.prefix || '');
  const [desc, setDesc] = useState(item?.description || '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ name, prefix, description: desc }); }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Tên danh mục *</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tiền tố mã (Prefix) *</label>
              <input className="form-input" value={prefix} onChange={(e) => setPrefix(e.target.value.toUpperCase())} placeholder="VD: SP, LT, PK..." required />
              <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Dùng để sinh mã sản phẩm tự động (VD: SP-0001)</small>
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả</label>
              <textarea className="form-input" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
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

export default CategoriesPage;
