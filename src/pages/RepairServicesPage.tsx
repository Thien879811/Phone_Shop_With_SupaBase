import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, Wrench, X, List } from 'lucide-react';
import { repairsApi, productsApi, type RepairService, type Product } from '../services/api';

const formatPrice = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

export const RepairServicesPage: React.FC = () => {
  const [data, setData] = useState<RepairService[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    serviceType: 'REPAIR' as 'REPAIR' | 'REPLACEMENT',
    defaultPrice: 0,
    productId: undefined as number | undefined,
    description: '',
    status: 'ACTIVE'
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await repairsApi.getAllServices();
      const prodRes = await productsApi.getAll({ limit: 500 });
      setData(res);
      setProducts(prodRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    if (form.serviceType === 'REPLACEMENT' && !form.productId) {
      alert('Thay thế linh kiện yêu cầu chọn sản phẩm');
      return;
    }

    try {
      if (editingId) {
        await repairsApi.updateService(editingId, form); 
      } else {
        await repairsApi.createService(form);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ name: '', serviceType: 'REPAIR', defaultPrice: 0, productId: undefined, description: '', status: 'ACTIVE' });
      loadData();
    } catch (err) { alert('Lỗi lưu dịch vụ'); }
  };

  const handleEdit = (item: RepairService) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      serviceType: item.serviceType,
      defaultPrice: item.defaultPrice,
      productId: item.productId,
      description: item.description || '',
      status: item.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
    try {
      await repairsApi.deleteService(id);
      loadData();
    } catch (err) { alert('Không thể xóa dịch vụ này (có thể đã được sử dụng)'); }
  };

  const filteredData = data.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="services-page">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Danh mục dịch vụ</h2>
          <p>Quản lý các loại dịch vụ sửa chữa chuẩn của cửa hàng</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditingId(null); }}>
            <Plus size={16} /> Thêm dịch vụ
          </button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div className="search-box">
            <Search size={16} />
            <input 
              placeholder="Tìm tên dịch vụ..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên dịch vụ</th>
                <th>Loại</th>
                <th>Liên kết sản phẩm</th>
                <th>Giá mặc định</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><List size={40} /><p>Chưa có dịch vụ nào</p></div></td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td><span className="cell-main">{item.name}</span></td>
                    <td>
                       <span className={`badge badge-sm ${item.serviceType === 'REPLACEMENT' ? 'badge-info' : 'badge-ghost'}`}>
                        {item.serviceType === 'REPLACEMENT' ? 'Thay linh kiện' : 'Dịch vụ sửa'}
                       </span>
                    </td>
                    <td>
                      {item.productId ? (
                        <div className="cell-multi">
                           <span className="primary-text">{products.find(p => p.id === item.productId)?.name || 'Sản phẩm ID: '+item.productId}</span>
                           <br />
                           <span className="secondary-text">Code: {products.find(p => p.id === item.productId)?.code || '—'}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td><span className="price highlight">{formatPrice(item.defaultPrice)}</span></td>
                    <td>
                      <span className={`badge ${item.status === 'ACTIVE' ? 'badge-success' : 'badge-ghost'}`}>
                        {item.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                         <button className="btn btn-ghost btn-icon" title="Sửa" onClick={() => handleEdit(item)}>
                           <Edit2 size={14} color="var(--primary)"/>
                         </button>
                         <button className="btn btn-ghost btn-icon" title="Xóa" onClick={() => handleDelete(item.id)}>
                           <Trash2 size={14} color="var(--danger)"/>
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ sửa chữa mới'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên dịch vụ (Ví dụ: Thay pin iPhone 11)</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                </div>
                
                <div className="form-group" style={{ marginTop: 15 }}>
                  <label className="form-label">Loại dịch vụ</label>
                  <select className="form-input" value={form.serviceType} onChange={(e) => setForm({...form, serviceType: e.target.value as any, productId: e.target.value === 'REPAIR' ? undefined : form.productId})}>
                    <option value="REPAIR">Sửa chữa (Không liên quan kho)</option>
                    <option value="REPLACEMENT">Thay thế linh kiện (Trừ kho)</option>
                  </select>
                </div>

                {form.serviceType === 'REPLACEMENT' && (
                  <div className="form-group" style={{ marginTop: 15 }}>
                    <label className="form-label">Chọn sản phẩm liên kết (để trừ kho)</label>
                    <select className="form-input" value={form.productId} onChange={(e) => setForm({...form, productId: Number(e.target.value)})} required>
                      <option value="">-- Chọn sản phẩm --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group" style={{ marginTop: 15 }}>
                  <label className="form-label">Giá chuẩn (VNĐ)</label>
                  <input className="form-input" type="number" value={form.defaultPrice} onChange={(e) => setForm({...form, defaultPrice: Number(e.target.value)})} />
                </div>
                <div className="form-group" style={{ marginTop: 15 }}>
                  <label className="form-label">Mô tả chi tiết</label>
                  <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                </div>
                <div className="form-group" style={{ marginTop: 15 }}>
                  <label className="form-label">Trạng thái</label>
                  <select className="form-input" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Tạm dừng</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu dịch vụ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairServicesPage;
