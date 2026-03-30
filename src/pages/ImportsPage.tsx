import React, { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, X, Package, Search } from 'lucide-react';
import { importsApi, productsApi, suppliersApi, type ImportReceipt, type Product, type Supplier } from '../services/api';

const formatPrice = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const ImportsPage: React.FC = () => {
  const [data, setData] = useState<ImportReceipt[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewItem, setViewItem] = useState<ImportReceipt | null>(null);
  const limit = 15;

  useEffect(() => { loadData(); }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await importsApi.getAll({ page, limit, search });
      setData(res.data);
      setTotal(res.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setPage(1); loadData(); };

  const handleCreate = async (formData: any) => {
    try {
      await importsApi.create(formData);
      setShowForm(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi tạo phiếu nhập');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Phiếu nhập kho</h2>
          <p>Quản lý phiếu nhập hàng từ nhà cung cấp</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Tạo phiếu nhập
          </button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Tìm theo mã phiếu..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Nhà cung cấp</th>
                <th>Ngày nhập</th>
                <th>Số SP</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><Package size={40} /><p>Chưa có phiếu nhập</p></div></td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td><span className="cell-main">{item.code}</span></td>
                    <td>{item.supplier?.name || '—'}</td>
                    <td>{formatDate(item.importDate)}</td>
                    <td style={{ textAlign: 'center' }}>{item.items?.length || 0}</td>
                    <td><span className="price highlight">{formatPrice(item.totalAmount)}</span></td>
                    <td>
                      <span className={`badge ${item.status === 'CONFIRMED' ? 'badge-success' : item.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                        {item.status === 'CONFIRMED' ? 'Đã xác nhận' : item.status === 'CANCELLED' ? 'Đã hủy' : 'Nháp'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-icon" title="Xem" onClick={() => setViewItem(item)}><Eye size={15} /></button>
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

      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết phiếu nhập — {viewItem.code}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewItem(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid" style={{ marginBottom: 20 }}>
                <div><label className="form-label">Mã phiếu</label><p>{viewItem.code}</p></div>
                <div><label className="form-label">NCC</label><p>{viewItem.supplier?.name || '—'}</p></div>
                <div><label className="form-label">Ngày nhập</label><p>{formatDate(viewItem.importDate)}</p></div>
                <div><label className="form-label">Tổng tiền</label><p className="price highlight">{formatPrice(viewItem.totalAmount)}</p></div>
              </div>
              <h4 style={{ marginBottom: 12, color: 'var(--text-primary)' }}>Danh sách sản phẩm</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Giá nhập</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {viewItem.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td><span className="cell-main">{it.productName || `#${it.productId}`}</span></td>
                      <td>{it.quantity}</td>
                      <td>{formatPrice(it.importPrice)}</td>
                      <td><span className="price">{formatPrice(it.totalPrice || it.quantity * it.importPrice)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <ImportFormModal onClose={() => setShowForm(false)} onSave={handleCreate} />
      )}
    </div>
  );
};

const ImportFormModal: React.FC<{ onClose: () => void; onSave: (data: any) => void }> = ({ onClose, onSave }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({
    code: `PN${Date.now().toString().slice(-6)}`,
    supplierId: '',
    importDate: new Date().toISOString().split('T')[0],
    note: '',
  });

  const [items, setItems] = useState<Array<{ productId: string; quantity: number; importPrice: number }>>([
    { productId: '', quantity: 1, importPrice: 0 },
  ]);

  useEffect(() => {
    productsApi.getAll({ limit: 100 }).then((r: any) => setProducts(r.data)).catch(() => {});
    suppliersApi.getAll({ limit: 100 }).then((r: any) => setSuppliers(r.data)).catch(() => {});
  }, []);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, importPrice: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    setItems(updated);
  };

  const totalAmount = items.reduce((sum, it) => sum + it.quantity * it.importPrice, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((it) => it.productId && it.quantity > 0);
    if (validItems.length === 0) { alert('Vui lòng thêm ít nhất 1 sản phẩm'); return; }

    onSave({
      code: form.code,
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      importDate: form.importDate,
      note: form.note,
      items: validItems.map((it) => ({
        productId: Number(it.productId),
        quantity: it.quantity,
        importPrice: it.importPrice,
      })),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Tạo phiếu nhập kho</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Mã phiếu</label>
                <input className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Nhà cung cấp</label>
                <select className="form-input" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                  <option value="">-- Chọn NCC --</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ngày nhập</label>
                <input className="form-input" type="date" value={form.importDate} onChange={(e) => setForm({ ...form, importDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <input className="form-input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
            </div>

            <h4 style={{ margin: '20px 0 12px', color: 'var(--text-primary)' }}>Chi tiết sản phẩm nhập</h4>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-end' }}>
                <div style={{ flex: 3 }}>
                  {idx === 0 && <label className="form-label">Sản phẩm</label>}
                  <select className="form-input" value={item.productId} onChange={(e) => updateItem(idx, 'productId', e.target.value)}>
                    <option value="">-- Chọn SP --</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  {idx === 0 && <label className="form-label">Số lượng</label>}
                  <input className="form-input" type="number" min={1} value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
                </div>
                <div style={{ flex: 2 }}>
                  {idx === 0 && <label className="form-label">Giá nhập (VNĐ)</label>}
                  <input className="form-input" type="number" min={0} value={item.importPrice} onChange={(e) => updateItem(idx, 'importPrice', Number(e.target.value))} />
                </div>
                <div style={{ flex: 1.5, textAlign: 'right' }}>
                  {idx === 0 && <label className="form-label">Thành tiền</label>}
                  <div className="price" style={{ padding: '10px 0' }}>{formatPrice(item.quantity * item.importPrice)}</div>
                </div>
                <button type="button" className="btn btn-ghost btn-icon" onClick={() => removeItem(idx)} style={{ color: 'var(--danger)' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={addItem} style={{ marginTop: 4 }}>
              <Plus size={14} /> Thêm dòng
            </button>

            <div style={{ textAlign: 'right', marginTop: 20, fontSize: 16, fontWeight: 700, color: 'var(--success)' }}>
              Tổng cộng: {formatPrice(totalAmount)}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-success">Xác nhận nhập kho</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportsPage;
