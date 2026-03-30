import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { productsApi, suppliersApi, type Product, type Supplier } from '../services/api';
import { formatPrice } from '../utils/format';

interface ImportFormModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export const ImportFormModal: React.FC<ImportFormModalProps> = ({ onClose, onSave }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({
    code: `PN${Date.now().toString().slice(-6)}`,
    supplier_id: '',
    receipt_date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const [items, setItems] = useState<Array<{ product_id: string; quantity: number; import_price: number }>>([
    { product_id: '', quantity: 1, import_price: 0 },
  ]);

  useEffect(() => {
    productsApi.getAll({ limit: 100 }).then((r: any) => setProducts(r.data)).catch(() => {});
    suppliersApi.getAll({ limit: 100 }).then((r: any) => setSuppliers(r.data)).catch(() => {});
  }, []);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1, import_price: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    setItems(updated);
  };

  const total_amount = items.reduce((sum, it) => sum + it.quantity * it.import_price, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((it) => it.product_id && it.quantity > 0);
    if (validItems.length === 0) { alert('Vui lòng thêm ít nhất 1 sản phẩm'); return; }

    onSave({
      code: form.code,
      supplier_id: form.supplier_id || null,
      receipt_date: form.receipt_date,
      total_amount: total_amount,
      note: form.note,
      items: validItems.map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity,
        import_price: it.import_price,
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
                <select className="form-input" value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}>
                  <option value="">-- Chọn NCC --</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ngày nhập</label>
                <input className="form-input" type="date" value={form.receipt_date} onChange={(e) => setForm({ ...form, receipt_date: e.target.value })} />
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
                  <select className="form-input" value={item.product_id} onChange={(e) => updateItem(idx, 'product_id', e.target.value)}>
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
                  <input className="form-input" type="number" min={0} value={item.import_price} onChange={(e) => updateItem(idx, 'import_price', Number(e.target.value))} />
                </div>
                <div style={{ flex: 1.5, textAlign: 'right' }}>
                  {idx === 0 && <label className="form-label">Thành tiền</label>}
                  <div className="price" style={{ padding: '10px 0' }}>{formatPrice(item.quantity * item.import_price)}</div>
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
              Tổng cộng: {formatPrice(total_amount)}
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
