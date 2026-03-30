import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { productsApi, type Product } from '../services/api';
import { formatPrice } from '../utils/format';

interface SalesFormModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export const SalesFormModal: React.FC<SalesFormModalProps> = ({ onClose, onSave }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    code: `HD${Date.now().toString().slice(-6)}`,
    customer_name: '',
    customer_phone: '',
    note: '',
  });
  const [items, setItems] = useState<Array<{ product_id: string; quantity: number; price: number }>>([
    { product_id: '', quantity: 1, price: 0 },
  ]);

  useEffect(() => {
    productsApi.getAll({ limit: 100 }).then((r: any) => setProducts(r.data)).catch(() => {});
  }, []);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1, price: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    if (field === 'product_id') {
      const product = products.find((p) => p.id === value);
      if (product) updated[idx].price = Number(product.price);
    }
    setItems(updated);
  };

  const totalAmount = items.reduce((s, it) => s + it.quantity * it.price, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = items.filter((it) => it.product_id && it.quantity > 0);
    if (!valid.length) { alert('Vui lòng thêm ít nhất 1 sản phẩm'); return; }
    onSave({
      ...form,
      total_amount: totalAmount,
      items: valid.map((it) => ({ product_id: it.product_id, quantity: it.quantity, price: it.price })),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Tạo hóa đơn bán hàng</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Mã HD</label>
                <input className="form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Khách hàng</label>
                <input className="form-input" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">SĐT</label>
                <input className="form-input" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <input className="form-input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
            </div>
            <h4 style={{ margin: '20px 0 12px' }}>Sản phẩm bán</h4>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-end' }}>
                <div style={{ flex: 3 }}>
                  {idx === 0 && <label className="form-label">Sản phẩm</label>}
                  <select className="form-input" value={item.product_id} onChange={(e) => updateItem(idx, 'product_id', e.target.value)}>
                    <option value="">-- Chọn SP --</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  {idx === 0 && <label className="form-label">SL</label>}
                  <input className="form-input" type="number" min={1} value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
                </div>
                <div style={{ flex: 2 }}>
                  {idx === 0 && <label className="form-label">Đơn giá</label>}
                  <input className="form-input" type="number" min={0} value={item.price} onChange={(e) => updateItem(idx, 'price', Number(e.target.value))} />
                </div>
                <div style={{ flex: 1.5, textAlign: 'right' }}>
                  {idx === 0 && <label className="form-label">Thành tiền</label>}
                  <div className="price" style={{ padding: '10px 0' }}>{formatPrice(item.quantity * item.price)}</div>
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
            <button type="submit" className="btn btn-success">Xác nhận bán</button>
          </div>
        </form>
      </div>
    </div>
  );
};
