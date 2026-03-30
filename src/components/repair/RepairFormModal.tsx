import React, { useState } from 'react';
import { X } from 'lucide-react';

interface RepairFormModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export const RepairFormModal: React.FC<RepairFormModalProps> = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    code: `SC${Date.now().toString().slice(-6)}`,
    customer_name: '',
    customer_phone: '',
    device_name: '',
    imei: '',
    issue_description: '',
    expected_return_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.customer_phone) {
      alert('Vui lòng nhập đầy đủ tên và SĐT khách hàng');
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Tiếp nhận máy sửa chữa</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Mã phiếu</label>
                <input className="form-input" value={form.code} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input className="form-input" value={form.customer_phone} onChange={(e) => setForm({...form, customer_phone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Tên khách hàng</label>
                <input className="form-input" value={form.customer_name} onChange={(e) => setForm({...form, customer_name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Tên thiết bị</label>
                <input className="form-input" value={form.device_name} onChange={(e) => setForm({...form, device_name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">IMEI / Serial</label>
                <input className="form-input" value={form.imei} onChange={(e) => setForm({...form, imei: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Ngày trả dự kiến</label>
                <input className="form-input" type="date" value={form.expected_return_date} onChange={(e) => setForm({...form, expected_return_date: e.target.value})} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 15 }}>
              <label className="form-label">Tình trạng / Lỗi</label>
              <textarea 
                className="form-input" 
                rows={3} 
                value={form.issue_description} 
                onChange={(e) => setForm({...form, issue_description: e.target.value})}
                placeholder="Mô tả lỗi của máy..."
              />
            </div>
            <div className="form-group" style={{ marginTop: 15 }}>
              <label className="form-label">Ghi chú khác</label>
              <input className="form-input" value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">Tạo phiếu tiếp nhận</button>
          </div>
        </form>
      </div>
    </div>
  );
};
