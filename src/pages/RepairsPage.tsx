import React, { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, X, Wrench, Search, CreditCard, ShoppingCart, AlertTriangle } from 'lucide-react';
import { repairsApi, productsApi, suppliersApi, stocksApi, type RepairOrder, type RepairService, type Product, type Supplier } from '../services/api';

const formatPrice = (val: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const formatDate = (d: string | Date) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const STATUS_MAP: Record<string, { label: string, color: string }> = {
  RECEIVED: { label: 'Tiếp nhận', color: 'badge-warning' },
  CHECKING: { label: 'Đang kiểm tra', color: 'badge-info' },
  WAITING_PART: { label: 'Chờ linh kiện', color: 'badge-danger' },
  REPAIRING: { label: 'Đang sửa', color: 'badge-primary' },
  COMPLETED: { label: 'Hoàn thành', color: 'badge-success' },
  DELIVERED: { label: 'Đã trả máy', color: 'badge-ghost' },
  CANCELLED: { label: 'Đã hủy', color: 'badge-danger' },
};

export const RepairsPage: React.FC = () => {
  const [data, setData] = useState<RepairOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null);
  const [showQuickImport, setShowQuickImport] = useState<{ productId: number; repairOrderId: number } | null>(null);
  
  const limit = 15;

  useEffect(() => { loadData(); }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await repairsApi.getAll({ page, limit, search });
      setData(res.data);
      setTotal(res.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setPage(1); loadData(); };

  const handleCreate = async (formData: any) => {
    try {
      await repairsApi.create(formData);
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi tạo phiếu sửa chữa');
    }
  };

  const handleStatusUpdate = async (id: number, status: string, note?: string) => {
    try {
      await repairsApi.update(id, { status, statusNote: note });
      // Refresh current detail if open
      if (selectedOrder?.id === id) {
        const updated = await repairsApi.getById(id);
        setSelectedOrder(updated);
      }
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleCreateInvoice = async (id: number) => {
    try {
      await repairsApi.complete(id);
      alert('Sửa chữa đã hoàn thành và hóa đơn đã được tạo!');
      loadData();
      if (selectedOrder?.id === id) setSelectedOrder(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi hoàn tất sửa chữa');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="repairs-page">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Sửa chữa & Bảo hành</h2>
          <p>Quản lý tiếp nhận, sửa chữa thiết bị và thay thế linh kiện</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Tiếp nhận sửa chữa
          </button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div className="search-box">
            <Search size={16} />
            <input 
              placeholder="Tìm theo mã code, khách hàng, thiết bị..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Khách hàng</th>
                <th>Thiết bị / IMEI</th>
                <th>Ngày nhận</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><Wrench size={40} /><p>Chưa có phiếu sửa chữa nào</p></div></td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover-row">
                    <td><span className="cell-main">{item.code}</span></td>
                    <td>
                      <div className="cell-multi">
                        <span className="primary-text">{item.customerName || 'Khách lẻ'}</span>
                        <span className="secondary-text">{item.customerPhone || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="cell-multi">
                        <span className="primary-text">{item.deviceName}</span>
                        <span className="secondary-text">IMEI: {item.imei || '—'}</span>
                      </div>
                    </td>
                    <td>{formatDate(item.receivedDate)}</td>
                    <td>
                      <span className={`badge ${STATUS_MAP[item.status]?.color || 'badge-ghost'}`}>
                        {STATUS_MAP[item.status]?.label || item.status}
                      </span>
                    </td>
                    <td><span className="price highlight">{formatPrice(item.totalAmount)}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-icon" title="Chi tiết" onClick={() => setSelectedOrder(item)}><Eye size={15} /></button>
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

      {showCreateModal && (
        <CreateRepairModal 
          onClose={() => setShowCreateModal(false)} 
          onSave={handleCreate} 
        />
      )}

      {selectedOrder && (
        <RepairDetailModal 
          order={selectedOrder} 
          onClose={() => { setSelectedOrder(null); loadData(); }} 
          onStatusUpdate={handleStatusUpdate}
          onShowQuickImport={(productId, repairOrderId) => setShowQuickImport({ productId, repairOrderId })}
          onCreateInvoice={handleCreateInvoice}
        />
      )}

      {showQuickImport && (
        <QuickImportModal 
          productId={showQuickImport.productId}
          repairOrderId={showQuickImport.repairOrderId}
          onClose={() => setShowQuickImport(null)}
          onSuccess={() => {
            setShowQuickImport(null);
            // Refresh detail
            if (selectedOrder) {
              repairsApi.getById(selectedOrder.id).then(setSelectedOrder);
            }
          }}
        />
      )}
    </div>
  );
};

// --- Sub-components ---

const CreateRepairModal: React.FC<{ onClose: () => void; onSave: (data: any) => void }> = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deviceName: '',
    imei: '',
    issueDescription: '',
    expectedReturnDate: '',
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.deviceName) { alert('Vui lòng nhập tên máy'); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Tiếp nhận sửa chữa mới</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-section">
              <h4 className="section-title">Thông tin khách hàng</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tên khách hàng</label>
                  <input className="form-input" placeholder="Nguyễn Văn A" value={form.customerName} onChange={(e) => setForm({...form, customerName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input className="form-input" placeholder="0901 xxx xxx" value={form.customerPhone} onChange={(e) => setForm({...form, customerPhone: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="form-section" style={{ marginTop: 20 }}>
              <h4 className="section-title">Thông tin thiết bị</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tên máy / Model</label>
                  <input className="form-input" placeholder="iPhone 13 Pro Max" value={form.deviceName} onChange={(e) => setForm({...form, deviceName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Số IMEI / Serial</label>
                  <input className="form-input" placeholder="3562..." value={form.imei} onChange={(e) => setForm({...form, imei: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Mô tả tình trạng / Lỗi</label>
                <textarea className="form-input" rows={3} placeholder="Máy rơi nước, không lên nguồn..." value={form.issueDescription} onChange={(e) => setForm({...form, issueDescription: e.target.value})} />
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: 20 }}>
              <div className="form-group">
                <label className="form-label">Hẹn trả (dự kiến)</label>
                <input className="form-input" type="datetime-local" value={form.expectedReturnDate} onChange={(e) => setForm({...form, expectedReturnDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú khác</label>
                <input className="form-input" value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} />
              </div>
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

const RepairDetailModal: React.FC<{ 
  order: RepairOrder; 
  onClose: () => void;
  onStatusUpdate: (id: number, status: string, note?: string) => void;
  onShowQuickImport: (productId: number, repairOrderId: number) => void;
  onCreateInvoice: (id: number) => void;
}> = ({ order, onClose, onStatusUpdate, onShowQuickImport, onCreateInvoice }) => {
  const [activeTab, setActiveTab] = useState<'items' | 'logs'>('items');
  const [services, setServices] = useState<RepairService[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ itemId: '', quantity: 1, price: 0 });

  useEffect(() => {
    repairsApi.getAllServices().then(setServices);
    productsApi.getAll({ limit: 200 }).then(r => setProducts(r.data));
    stocksApi.getSummary({ limit: 200 }).then(r => setStocks(r.data));
  }, []);

  const handleAddItem = async () => {
    if (!newItem.itemId) { alert('Chọn dịch vụ'); return; }
    
    try {
      const service = services.find(s => s.id === Number(newItem.itemId));
      if (!service) return;

      const payload: any = {
        serviceId: service.id,
        quantity: newItem.quantity,
        price: newItem.price,
        productId: service.serviceType === 'REPLACEMENT' ? (service.productId || newItem.itemId) : null // Normally service has productId
      };
      await repairsApi.addService(order.id, payload);
      setShowAddItem(false);
      setNewItem({ itemId: '', quantity: 1, price: 0 });
      onClose(); // Temporary: just close and let parent refresh
    } catch (err: any) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('Không đủ linh kiện')) {
        const service = services.find(s => s.id === Number(newItem.itemId));
        if (service?.productId && window.confirm(`${msg}. Bạn có muốn nhập kho nhanh cho linh kiện này không?`)) {
          onShowQuickImport(service.productId, order.id);
        }
      } else {
        alert(msg || 'Lỗi thêm hạng mục');
      }
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!window.confirm('Xóa hạng mục này?')) return;
    try {
      await repairsApi.removeItem(order.id, itemId);
      onClose();
    } catch (err) { alert('Lỗi xóa'); }
  };

  const selectedService = newItem.itemId ? services.find(s => s.id === Number(newItem.itemId)) : null;
  const currentStockForSvc = selectedService?.serviceType === 'REPLACEMENT' && selectedService.productId
    ? stocks.find(s => s.productId === selectedService.productId)?.totalRemaining || 0
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ minHeight: '80vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={`badge ${STATUS_MAP[order.status]?.color}`}>{STATUS_MAP[order.status]?.label}</span>
            <h3>Chi tiết phiếu — {order.code}</h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Info Bar */}
          <div className="form-grid" style={{ backgroundColor: 'var(--bg-secondary)', padding: 15, borderRadius: 8 }}>
            <div><label className="form-label">Khách hàng</label><p className="form-value">{order.customerName} ({order.customerPhone})</p></div>
            <div><label className="form-label">Thiết bị</label><p className="form-value">{order.deviceName} — {order.imei || 'No IMEI'}</p></div>
            <div><label className="form-label">Dự kiến trả</label><p className="form-value">{formatDate(order.expectedReturnDate || '')}</p></div>
            <div><label className="form-label">Ngày nhận</label><p className="form-value">{formatDate(order.receivedDate)}</p></div>
          </div>

          <div>
            <label className="form-label">Mô tả tình trạng</label>
            <p className="form-value" style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
              {order.issueDescription || 'Không có mô tả'}
            </p>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {order.status === 'RECEIVED' && <button className="btn btn-sm btn-outline" onClick={() => onStatusUpdate(order.id, 'CHECKING')}>Bắt đầu kiểm tra</button>}
              {['CHECKING', 'WAITING_PART'].includes(order.status) && <button className="btn btn-sm btn-primary" onClick={() => onStatusUpdate(order.id, 'REPAIRING')}>Bắt đầu sửa</button>}
              {order.status === 'REPAIRING' && (
                <button className="btn btn-sm btn-success" onClick={() => {
                   if (window.confirm('Xác nhận hoàn thành sửa chữa? Hệ thống sẽ tạo hóa đơn và trừ kho linh kiện.')) {
                     onCreateInvoice(order.id);
                   }
                }}>
                  <CreditCard size={14} /> Hoàn thành & Trả máy
                </button>
              )}
            </div>
            
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {['RECEIVED', 'CHECKING', 'WAITING_PART', 'REPAIRING'].includes(order.status) && (
                <button className="btn btn-sm btn-danger btn-outline" onClick={() => onStatusUpdate(order.id, 'CANCELLED', prompt('Lý do hủy?') || '')}>Hủy sửa chữa</button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>Dịch vụ & Linh kiện ({order.items?.length || 0})</button>
            <button className={`tab ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>Lịch sử trạng thái</button>
          </div>

          {activeTab === 'items' ? (
            <div className="tab-content" style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ color: 'var(--text-primary)' }}>Chi phí sửa chữa</h4>
                {!['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(order.status) && (
                  <button className="btn btn-sm btn-outline" onClick={() => setShowAddItem(true)}><Plus size={14} /> Thêm dịch vụ / Thay linh kiện</button>
                )}
              </div>

              {showAddItem && (
                <div style={{ background: 'var(--bg-secondary)', padding: 15, borderRadius: 8, marginBottom: 15, border: '1px solid var(--border-color)' }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Chọn dịch vụ</label>
                      <select 
                        className="form-input" 
                        value={newItem.itemId} 
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const svc = services.find(s => s.id === id);
                          setNewItem({...newItem, itemId: e.target.value, price: svc?.defaultPrice || 0});
                        }}
                      >
                        <option value="">-- Chọn dịch vụ --</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.serviceType})</option>)}
                      </select>
                      {selectedService?.serviceType === 'REPLACEMENT' && (
                        <div style={{ marginTop: 4, fontSize: 12, color: currentStockForSvc <= 0 ? 'var(--danger)' : 'var(--success)' }}>
                          Linh kiện: {products.find(p => p.id === selectedService.productId)?.name || '...'} | Tồn kho: {currentStockForSvc}
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
                    <button className="btn btn-primary" onClick={handleAddItem}>Thêm hạng mục</button>
                  </div>
                </div>
              )}

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hạng mục</th>
                    <th>Loại</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th style={{ textAlign: 'center' }}>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>Chưa có chi phí nào</td></tr>
                  ) : (
                    order.items?.map((it) => (
                      <tr key={it.id}>
                        <td><span className="cell-main">{it.serviceName}</span></td>
                        <td>
                          <span className={`badge badge-sm ${it.serviceType === 'REPLACEMENT' ? 'badge-info' : 'badge-ghost'}`}>
                            {it.serviceType === 'REPLACEMENT' ? 'Linh kiện' : 'Dịch vụ'}
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
                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>Tổng cộng:</td>
                    <td><span className="price highlight" style={{ fontSize: 18 }}>{formatPrice(order.totalAmount)}</span></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="tab-content" style={{ flex: 1 }}>
               <div className="timeline">
                  {order.logs?.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((log) => (
                    <div key={log.id} className="timeline-item">
                      <div className="timeline-marker" />
                      <div className="timeline-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className={`badge badge-sm ${STATUS_MAP[log.status]?.color}`}>{STATUS_MAP[log.status]?.label}</span>
                          <span className="secondary-text">{formatDate(log.createdAt)}</span>
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

const QuickImportModal: React.FC<{ 
  productId: number; 
  repairOrderId: number; 
  onClose: () => void; 
  onSuccess: () => void;
}> = ({ productId, repairOrderId, onClose, onSuccess }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({
    supplierId: '',
    quantity: 1,
    importPrice: 0,
    note: ''
  });

  useEffect(() => {
    productsApi.getById(productId).then(setProduct);
    suppliersApi.getAll({ limit: 100 }).then(r => setSuppliers(r.data));
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplierId) { alert('Chọn nhà cung cấp'); return; }
    try {
      await repairsApi.quickImport({
        ...form,
        productId,
        repairOrderId,
        supplierId: Number(form.supplierId)
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
              <select className="form-input" value={form.supplierId} onChange={(e) => setForm({...form, supplierId: e.target.value})} required>
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
                <input className="form-input" type="number" value={form.importPrice} onChange={(e) => setForm({...form, importPrice: Number(e.target.value)})} required />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 15 }}>
              <label className="form-label">Ghi chú nhập hàng</label>
              <input className="form-input" placeholder="Nhập gấp để sửa máy cho khách..." value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} />
            </div>

            <div style={{ marginTop: 20, textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
              Tổng tiền nhập: {formatPrice(form.quantity * form.importPrice)}
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

export default RepairsPage;
