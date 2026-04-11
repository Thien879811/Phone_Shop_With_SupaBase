import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { type Supplier } from '../services/api';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../hooks/useInventory';

export const SuppliersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 15;

  const { data: suppliersData, isLoading: loading } = useSuppliers({ page, limit, search });
  const data = suppliersData?.data || [];
  const total = suppliersData?.total || 0;

  const createSupplierM = useCreateSupplier();
  const updateSupplierM = useUpdateSupplier();
  const deleteSupplierM = useDeleteSupplier();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);

  const handleSearch = () => { setPage(1); };

  const handleDelete = async (item: Supplier) => {
    if (!confirm(`Xóa nhà cung cấp "${item.name}"?`)) return;
    try {
      await deleteSupplierM.mutateAsync(item.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  const handleSave = async (formData: Partial<Supplier>) => {
    try {
      if (editItem) {
        await updateSupplierM.mutateAsync({ id: editItem.id, data: formData });
      } else {
        await createSupplierM.mutateAsync(formData);
      }
      setShowForm(false);
      setEditItem(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Nhà cung cấp</h2>
          <p>Quản lý danh sách nhà cung cấp</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
            <Plus size={16} /> Thêm NCC
          </button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Tìm nhà cung cấp..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên NCC</th>
                <th>Điện thoại</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th>Ghi chú</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><p>Chưa có nhà cung cấp</p></div></td></tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{(page - 1) * limit + idx + 1}</td>
                    <td><span className="cell-main">{item.name}</span></td>
                    <td>{item.phone || '—'}</td>
                    <td>{item.email || '—'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.address || '—'}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.note || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => { setEditItem(item); setShowForm(true); }}><Pencil size={15} /></button>
                        <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(item)} style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
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
            <span>{(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total}</span>
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
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditItem(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowForm(false); setEditItem(null); }}><X size={18} /></button>
            </div>
            <SupplierForm supplier={editItem} onSave={handleSave} onClose={() => { setShowForm(false); setEditItem(null); }} />
          </div>
        </div>
      )}
    </div>
  );
};

const SupplierForm: React.FC<{ supplier: Supplier | null; onSave: (d: Partial<Supplier>) => void; onClose: () => void }> = ({ supplier, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: supplier?.name || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    note: supplier?.note || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { alert('Vui lòng nhập tên NCC'); return; }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-grid">
          <div className="form-group form-full">
            <label className="form-label">Tên nhà cung cấp *</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Điện thoại</label>
            <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group form-full">
            <label className="form-label">Địa chỉ</label>
            <input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="form-group form-full">
            <label className="form-label">Ghi chú</label>
            <textarea className="form-input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={3} />
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
        <button type="submit" className="btn btn-primary">Lưu</button>
      </div>
    </form>
  );
};

export default SuppliersPage;
