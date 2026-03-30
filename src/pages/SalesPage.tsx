import React, { useState, useEffect } from 'react';
import { Plus, Eye, X, ShoppingCart, Trash2, Search } from 'lucide-react';
import { salesApi, productsApi, type SalesInvoice, type Product } from '../services/api';

const formatPrice = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const SalesPage: React.FC = () => {
  const [data, setData] = useState<SalesInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewItem, setViewItem] = useState<SalesInvoice | null>(null);
  const limit = 15;

  useEffect(() => { loadData(); }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await salesApi.getAll({ page, limit, search });
      setData(res.data);
      setTotal(res.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setPage(1); loadData(); };

  const handleCreate = async (formData: any) => {
    try {
      await salesApi.create(formData);
      setShowForm(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Hoa don ban hang</h2>
          <p>Quan ly hoa don ban — xuat kho theo FIFO</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-success" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Tao hoa don
          </button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Tim ma hoa don..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Ma HD</th>
                <th>Khach hang</th>
                <th>SDT</th>
                <th>So SP</th>
                <th>Tong tien</th>
                <th>Trang thai</th>
                <th>Ngay tao</th>
                <th style={{ textAlign: 'center' }}>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><ShoppingCart size={40} /><p>Chua co hoa don</p></div></td></tr>
              ) : (
                data.map((item: SalesInvoice) => (
                  <tr key={item.id}>
                    <td><span className="cell-main">{item.code}</span></td>
                    <td>{item.customerName || 'Khach le'}</td>
                    <td>{item.customerPhone || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{item.items?.length || 0}</td>
                    <td><span className="price highlight">{formatPrice(item.totalAmount)}</span></td>
                    <td>
                      <span className={`badge ${item.status === 'CONFIRMED' ? 'badge-success' : item.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => setViewItem(item)}><Eye size={15} /></button>
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
            <span>{(page - 1) * limit + 1}-{Math.min(page * limit, total)} / {total}</span>
            <div className="pagination-btns">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>&lt;</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>&gt;</button>
            </div>
          </div>
        )}
      </div>

      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiet hoa don - {viewItem.code}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewItem(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid" style={{ marginBottom: 20 }}>
                <div><label className="form-label">Ma HD</label><p>{viewItem.code}</p></div>
                <div><label className="form-label">Khach hang</label><p>{viewItem.customerName || 'Khach le'}</p></div>
                <div><label className="form-label">SDT</label><p>{viewItem.customerPhone || '-'}</p></div>
                <div><label className="form-label">Tong tien</label><p className="price highlight">{formatPrice(viewItem.totalAmount)}</p></div>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>San pham</th><th>SL</th><th>Don gia</th><th>Thanh tien</th></tr>
                </thead>
                <tbody>
                  {viewItem.items?.map((it: any, idx: number) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{it.productName || `#${it.productId}`}</td>
                      <td>{it.quantity}</td>
                      <td>{formatPrice(it.price)}</td>
                      <td>{formatPrice(it.total || it.quantity * it.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showForm && <SalesFormModal onClose={() => setShowForm(false)} onSave={handleCreate} />}
    </div>
  );
};

const SalesFormModal: React.FC<{ onClose: () => void; onSave: (data: any) => void }> = ({ onClose, onSave }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    code: `HD${Date.now().toString().slice(-6)}`,
    customerName: '',
    customerPhone: '',
    note: '',
  });
  const [items, setItems] = useState<Array<{ productId: string; quantity: number; price: number }>>([
    { productId: '', quantity: 1, price: 0 },
  ]);

  useEffect(() => {
    productsApi.getAll({ limit: 100 }).then((r: any) => setProducts(r.data)).catch(() => {});
  }, []);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, price: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    if (field === 'productId') {
      const product = products.find((p) => p.id === Number(value));
      if (product) updated[idx].price = product.sellPrice;
    }
    setItems(updated);
  };

  const totalAmount = items.reduce((s, it) => s + it.quantity * it.price, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = items.filter((it) => it.productId && it.quantity > 0);
    if (!valid.length) { alert('Add at least 1 product'); return; }
    onSave({
      ...form,
      items: valid.map((it) => ({ productId: Number(it.productId), quantity: it.quantity, price: it.price })),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Tao hoa don ban hang</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Ma HD</label>
                <input className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Khach hang</label>
                <input className="form-input" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">SDT</label>
                <input className="form-input" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chu</label>
                <input className="form-input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
            </div>
            <h4 style={{ margin: '20px 0 12px' }}>San pham ban</h4>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-end' }}>
                <div style={{ flex: 3 }}>
                  {idx === 0 && <label className="form-label">San pham</label>}
                  <select className="form-input" value={item.productId} onChange={(e) => updateItem(idx, 'productId', e.target.value)}>
                    <option value="">-- Chon SP --</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  {idx === 0 && <label className="form-label">SL</label>}
                  <input className="form-input" type="number" min={1} value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
                </div>
                <div style={{ flex: 2 }}>
                  {idx === 0 && <label className="form-label">Don gia</label>}
                  <input className="form-input" type="number" min={0} value={item.price} onChange={(e) => updateItem(idx, 'price', Number(e.target.value))} />
                </div>
                <div style={{ flex: 1.5, textAlign: 'right' }}>
                  {idx === 0 && <label className="form-label">Thanh tien</label>}
                  <div className="price" style={{ padding: '10px 0' }}>{formatPrice(item.quantity * item.price)}</div>
                </div>
                <button type="button" className="btn btn-ghost btn-icon" onClick={() => removeItem(idx)} style={{ color: 'var(--danger)' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={addItem} style={{ marginTop: 4 }}>
              <Plus size={14} /> Them dong
            </button>
            <div style={{ textAlign: 'right', marginTop: 20, fontSize: 16, fontWeight: 700, color: 'var(--success)' }}>
              Tong cong: {formatPrice(totalAmount)}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Huy</button>
            <button type="submit" className="btn btn-success">Xac nhan ban</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesPage;
