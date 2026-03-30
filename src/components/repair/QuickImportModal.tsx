import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, AlertTriangle } from 'lucide-react';
import { productsApi, suppliersApi, repairsApi, type Product, type Supplier } from '../../services/api';
import { formatPrice } from '../../utils/format';

interface QuickImportModalProps {
  product_id: string;
  repair_order_id: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickImportModal: React.FC<QuickImportModalProps> = ({ 
  product_id, 
  repair_order_id, 
  onClose, 
  onSuccess 
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({
    supplier_id: '',
    quantity: 1,
    import_price: 0,
    note: ''
  });

  useEffect(() => {
    productsApi.getById(product_id).then(setProduct);
    suppliersApi.getAll({ limit: 100 }).then(r => setSuppliers(r.data));
  }, [product_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier_id) { alert('Vui lòng chọn nhà cung cấp'); return; }
    try {
      await repairsApi.quickImport({
        ...form,
        product_id,
        repair_order_id,
        supplier_id: form.supplier_id
      });
      alert('Nhập kho nhanh thành công');
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi nhập kho');
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: '2px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingCart className="text-warning" size={20} />
            <h3>Nhập kho nhanh cho sửa chữa</h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="alert alert-warning" style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertTriangle size={18} style={{ marginTop: 2 }} />
              <div>
                <strong>Linh kiện hiện đang hết hàng.</strong>
                <p style={{ fontSize: 13 }}>Sản phẩm: {product?.name || '...'}</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nhà cung cấp</label>
              <select className="form-input" value={form.supplier_id} onChange={(e) => setForm({...form, supplier_id: e.target.value})} required>
                <option value="">-- Chọn NCC --</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="form-grid" style={{ marginTop: 15 }}>
              <div className="form-group">
                <label className="form-label">Số lượng nhập</label>
                <input className="form-input" type="number" min={1} value={form.quantity} onChange={(e) => setForm({...form, quantity: Number(e.target.value)})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Giá nhập đơn vị (VNĐ)</label>
                <input className="form-input" type="number" value={form.import_price} onChange={(e) => setForm({...form, import_price: Number(e.target.value)})} required />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 15 }}>
              <label className="form-label">Ghi chú nhập hàng</label>
              <input className="form-input" placeholder="Nhập gấp để sửa máy cho khách..." value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} />
            </div>

            <div style={{ marginTop: 20, textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
              Tổng tiền nhập: {formatPrice(form.quantity * form.import_price)}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">Xác nhận nhập & Thêm vào phiếu</button>
          </div>
        </form>
      </div>
    </div>
  );
};
