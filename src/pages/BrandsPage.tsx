import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Apple } from 'lucide-react'; // Apple as a placeholder icon for brands
import { brandsApi, type Brand } from '../services/api';

export const BrandsPage: React.FC = () => {
  const [data, setData] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Brand | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await brandsApi.getAll();
      setData(res);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async (formData: Partial<Brand>) => {
    try {
      if (editItem) {
        await brandsApi.update(editItem.id, formData);
      } else {
        await brandsApi.create(formData);
      }
      setShowForm(false);
      setEditItem(null);
      loadData();
    } catch (err: any) { alert('Lỗi: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa thương hiệu này?')) return;
    try {
       await brandsApi.delete(id);
       loadData();
    } catch (err: any) { alert('Không thể xóa vì đã có sản phẩm thuộc thương hiệu này.'); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Thương hiệu</h2>
          <p>Quản lý các nhãn hàng đối tác</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
            <Plus size={16} /> Thêm thương hiệu
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
                <th>Tên nhãn hàng</th>
                <th>Xuất xứ</th>
                <th>Mô tả</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><Apple size={40} /><p>Chưa có thương hiệu nào</p></div></td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td><span className="cell-main">{item.name}</span></td>
                    <td>{item.origin || '—'}</td>
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
        <BrandFormModal 
          item={editItem} 
          onClose={() => setShowForm(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

const BrandFormModal: React.FC<{ item: Brand | null; onClose: () => void; onSave: (d: any) => void }> = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: item?.name || '',
    origin: item?.origin || '',
    description: item?.description || '',
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Tên nhãn hàng *</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Xuất xứ</label>
              <input className="form-input" value={form.origin} onChange={(e) => setForm({...form, origin: e.target.value})} placeholder="VD: USA, Vietnam, China..." />
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả</label>
              <textarea className="form-input" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} />
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

export default BrandsPage;
