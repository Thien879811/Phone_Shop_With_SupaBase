import React, { useState } from 'react';
import { X } from 'lucide-react';
import { type Product } from '../../services/api';

interface ServiceFormModalProps {
  editingId: number | null;
  products: Product[];
  initialData?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ 
  editingId, products, initialData, onClose, onSave 
}) => {
  const [form, setForm] = useState(initialData || {
    name: '',
    service_type: 'REPAIR' as 'REPAIR' | 'REPLACEMENT',
    default_price: 0,
    product_id: undefined as string | undefined,
    description: '',
    status: 'ACTIVE'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    if (form.service_type === 'REPLACEMENT' && !form.product_id) {
      alert('Thay thế linh kiện yêu cầu chọn sản phẩm');
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingId ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ sửa chữa mới'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Tên dịch vụ (Ví dụ: Thay pin iPhone 11)</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            </div>
            
            <div className="form-group" style={{ marginTop: 15 }}>
              <label className="form-label">Loại dịch vụ</label>
              <select className="form-input" value={form.service_type} onChange={(e) => setForm({...form, service_type: e.target.value as any, product_id: e.target.value === 'REPAIR' ? undefined : form.product_id})}>
                <option value="REPAIR">Sửa chữa (Không liên quan kho)</option>
                <option value="REPLACEMENT">Thay thế linh kiện (Trừ kho)</option>
              </select>
            </div>

            {form.service_type === 'REPLACEMENT' && (
              <div className="form-group" style={{ marginTop: 15 }}>
                <label className="form-label">Chọn sản phẩm liên kết (để trừ kho)</label>
                <select className="form-input" value={form.product_id} onChange={(e) => setForm({...form, product_id: e.target.value})} required>
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group" style={{ marginTop: 15 }}>
              <label className="form-label">Giá chuẩn (VNĐ)</label>
              <input className="form-input" type="number" value={form.default_price} onChange={(e) => setForm({...form, default_price: Number(e.target.value)})} />
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
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">Lưu dịch vụ</button>
          </div>
        </form>
      </div>
    </div>
  );
};
