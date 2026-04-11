import React, { useState } from 'react';
import { X, Plus, Trash2, CreditCard } from 'lucide-react';
import { type RepairOrder, type RepairService } from '../../services/api';
import { useRepairById, useRepairServices, useAddRepairService, useRemoveRepairItem } from '../../hooks/useRepairs';
import { useProducts } from '../../hooks/useProducts'; 
import { useStocks } from '../../hooks/useInventory'; 

import { formatPrice, formatFullDate } from '../../utils/format';
import { REPAIR_STATUS_MAP } from '../../constants/repair';

interface RepairDetailModalProps {
  order: RepairOrder;
  onClose: () => void;
  onStatusUpdate: (id: any, status: string, note?: string) => void;
  onShowQuickImport: (product_id: string, repair_order_id: string) => void;
  onCreateInvoice: (id: any) => void;
  onDelete: (id: any) => void;
}

export const RepairDetailModal: React.FC<RepairDetailModalProps> = ({ 
  order: initialOrder, onClose, onStatusUpdate, onShowQuickImport, onCreateInvoice, onDelete
}) => {
  const { data: order = initialOrder } = useRepairById(initialOrder.id);
  const { data: services = [] } = useRepairServices();
  const { data: productsData } = useProducts({ limit: 500 });
  const products = productsData?.data || [];
  const { data: stocks = [] } = useStocks({ limit: 500 });

  const addServiceM = useAddRepairService();
  const removeItemM = useRemoveRepairItem();
  
  const [activeTab, setActiveTab] = useState<'items' | 'logs'>('items');
  const [showAddItem, setShowAddItem] = useState(false);
  const [addMode, setAddMode] = useState<'service' | 'product'>('service');
  const [newItem, setNewItem] = useState({ item_id: '', quantity: 1, price: 0 });

  const handleAddItem = async () => {
    if (!newItem.item_id) { alert('Vui lòng chọn dịch vụ'); return; }
    
    try {
      let payload: any;
      
      if (addMode === 'service') {
        const service = services.find((s: RepairService) => s.id === newItem.item_id);
        if (!service) return;
        payload = {
          service_id: service.id,
          quantity: newItem.quantity,
          price: newItem.price,
          product_id: service.service_type === 'REPLACEMENT' ? (service.product_id || newItem.item_id) : null
        };
      } else {
        const prod = products.find(p => p.id === newItem.item_id);
        if (!prod) return;
        payload = {
          service_id: null,
          product_id: prod.id,
          quantity: newItem.quantity,
          price: newItem.price
        };
      }

      await addServiceM.mutateAsync({ id: order.id, data: payload });
      setShowAddItem(false);
      setNewItem({ item_id: '', quantity: 1, price: 0 });
    } catch (err: any) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('Không đủ linh kiện') || msg.includes('Không đủ hàng')) {
        let pid = '';
        if (addMode === 'service') {
          pid = services.find((s: RepairService) => s.id === newItem.item_id)?.product_id;
        } else {
          pid = newItem.item_id;
        }
        
        if (pid && window.confirm(`${msg}. Bạn có muốn nhập kho nhanh không?`)) {
          onShowQuickImport(pid, order.id);
        }
      } else {
        alert(msg || 'Lỗi thêm hạng mục');
      }
    }
  };

  const handleRemoveItem = async (it_id: any) => {
    if (!window.confirm('Xác nhận xóa hạng mục này?')) return;
    try {
      await removeItemM.mutateAsync({ orderId: order.id, itemId: it_id });
    } catch (err) { alert('Lỗi xóa'); }
  };

  const selectedService = addMode === 'service' && newItem.item_id ? services.find((s: RepairService) => s.id === newItem.item_id) : null;
  const selectedProduct = addMode === 'product' && newItem.item_id ? products.find(p => p.id === newItem.item_id) : null;
  
  const currentStockForSvc = addMode === 'service' 
    ? (selectedService?.service_type === 'REPLACEMENT' && selectedService.product_id ? stocks.find((s: any) => s.product_id === selectedService.product_id)?.total_remaining || 0 : 0)
    : (selectedProduct ? stocks.find((s: any) => s.product_id === selectedProduct.id)?.total_remaining || 0 : 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ minHeight: '80vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={`badge ${REPAIR_STATUS_MAP[order.status]?.color}`}>{REPAIR_STATUS_MAP[order.status]?.label}</span>
            <h3>Chi tiết phiếu — {order.code}</h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-grid" style={{ backgroundColor: 'var(--bg-secondary)', padding: 15, borderRadius: 8 }}>
            <div><label className="form-label">Khách hàng</label><p className="form-value">{order.customer_name} ({order.customer_phone})</p></div>
            <div><label className="form-label">Thiết bị</label><p className="form-value">{order.device_name} — {order.imei || 'No IMEI'}</p></div>
            <div><label className="form-label">Dự kiến trả</label><p className="form-value">{formatFullDate(order.expected_return_date || '')}</p></div>
            <div><label className="form-label">Ngày nhận</label><p className="form-value">{formatFullDate(order.received_date)}</p></div>
          </div>

          <div>
            <label className="form-label">Mô tả lỗi</label>
            <p className="form-value" style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
              {order.issue_description || 'Không có mô tả'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {order.status === 'RECEIVED' && <button className="btn btn-sm btn-outline" onClick={() => onStatusUpdate(order.id, 'CHECKING')}>Bắt đầu kiểm tra</button>}
            {['CHECKING', 'WAITING_PART'].includes(order.status) && <button className="btn btn-sm btn-primary" onClick={() => onStatusUpdate(order.id, 'REPAIRING')}>Bắt đầu sửa</button>}
            {['RECEIVED', 'CHECKING', 'WAITING_PART', 'REPAIRING'].includes(order.status) && (
              <button className="btn btn-sm btn-success" onClick={() => {
                 if (window.confirm('Xác nhận hoàn thành? Hệ thống sẽ tạo hóa đơn và trừ kho.')) {
                   onCreateInvoice(order.id);
                 }
              }}>
                <CreditCard size={14} /> Hoàn thành & Trả máy
              </button>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {['RECEIVED', 'CHECKING', 'WAITING_PART', 'REPAIRING'].includes(order.status) && (
                <>
                  <button className="btn btn-sm btn-danger btn-outline" onClick={() => onStatusUpdate(order.id, 'CANCELLED', prompt('Lý do hủy?') || '')}>Hủy sửa chữa</button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(order.id)}>
                    <Trash2 size={14} /> Xóa phiếu
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="tabs">
            <button className={`tab ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>Hạng mục ({order.items?.length || 0})</button>
            <button className={`tab ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>Lịch sử</button>
          </div>

          {activeTab === 'items' ? (
            <div className="tab-content" style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ color: 'var(--text-primary)' }}>Chi phí sửa chữa</h4>
                {!['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(order.status) && (
                  <button className="btn btn-sm btn-outline" onClick={() => setShowAddItem(true)}><Plus size={14} /> Thêm hạng mục</button>
                )}
              </div>

              {showAddItem && (
                <div style={{ background: 'var(--bg-secondary)', padding: 15, borderRadius: 8, marginBottom: 15, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                    <button className={`btn btn-sm ${addMode === 'service' ? 'btn-primary' : 'btn-outline'}`} onClick={() => {setAddMode('service'); setNewItem({...newItem, item_id: ''});}}>Dịch vụ/Linh kiện</button>
                    <button className={`btn btn-sm ${addMode === 'product' ? 'btn-primary' : 'btn-outline'}`} onClick={() => {setAddMode('product'); setNewItem({...newItem, item_id: ''});}}>Sản phẩm bán kèm</button>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">{addMode === 'service' ? 'Chọn dịch vụ' : 'Chọn sản phẩm'}</label>
                      <select 
                        className="form-input" 
                        value={newItem.item_id} 
                        onChange={(e) => {
                          const id = e.target.value;
                          if (addMode === 'service') {
                            const svc = services.find((s: RepairService) => s.id === id);
                            setNewItem({...newItem, item_id: id, price: svc?.default_price || 0});
                          } else {
                            const prod = products.find(p => p.id === id);
                            setNewItem({...newItem, item_id: id, price: prod?.price || 0});
                          }
                        }}
                      >
                        <option value="">-- {addMode === 'service' ? 'Chọn dịch vụ' : 'Chọn sản phẩm'} --</option>
                        {addMode === 'service' 
                          ? services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.service_type})</option>)
                          : products.map(p => <option key={p.id} value={p.id}>{p.name} - {p.code}</option>)
                        }
                      </select>
                      {(addMode === 'product' || selectedService?.service_type === 'REPLACEMENT') && (
                        <div style={{ marginTop: 4, fontSize: 12, color: currentStockForSvc <= 0 ? 'var(--danger)' : 'var(--success)' }}>
                          Tồn kho: {currentStockForSvc}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Giá (VNĐ)</label>
                      <input className="form-input" type="number" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số lượng</label>
                      <input className="form-input" type="number" min={1} value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 15, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost" onClick={() => setShowAddItem(false)}>Hủy</button>
                    <button className="btn btn-primary" onClick={handleAddItem}>Xác nhận</button>
                  </div>
                </div>
              )}

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hạng mục</th>
                    <th>Loại</th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th style={{ textAlign: 'center' }}>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>Chưa có chi phí</td></tr>
                  ) : (
                    order.items?.map((it: any) => (
                      <tr key={it.id}>
                        <td><span className="cell-main">{it.service_name || products.find(p => p.id === it.product_id)?.name || 'Sản phẩm'}</span></td>
                        <td>
                          <span className={`badge badge-sm ${
                            !it.service_id ? 'badge-success' :
                            it.service_type === 'REPLACEMENT' ? 'badge-info' : 'badge-ghost'
                          }`}>
                            {!it.service_id ? 'Bán kèm' : it.service_type === 'REPLACEMENT' ? 'Linh kiện' : 'Dịch vụ'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                        <td>{formatPrice(it.price)}</td>
                        <td><span className="price">{formatPrice(it.total)}</span></td>
                        <td style={{ textAlign: 'center' }}>
                          {!['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(order.status) && (
                            <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleRemoveItem(it.id)}><Trash2 size={14} /></button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>Tổng:</td>
                    <td><span className="price highlight" style={{ fontSize: 18 }}>{formatPrice(order.total_amount)}</span></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="tab-content" style={{ flex: 1 }}>
               <div className="timeline">
                  {(order.logs || []).slice().sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((log: any) => (
                    <div key={log.id} className="timeline-item">
                      <div className="timeline-marker" />
                      <div className="timeline-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className={`badge badge-sm ${REPAIR_STATUS_MAP[log.status]?.color}`}>{REPAIR_STATUS_MAP[log.status]?.label}</span>
                          <span className="secondary-text">{formatFullDate(log.created_at)}</span>
                        </div>
                        <p style={{ marginTop: 4 }}>{log.note}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
