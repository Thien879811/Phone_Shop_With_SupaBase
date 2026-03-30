import React, { useState, useEffect } from 'react';
import { Plus, Eye, Wrench, Search } from 'lucide-react';
import { repairsApi, type RepairOrder } from '../services/api';
import { formatPrice, formatFullDate } from '../utils/format';
import { REPAIR_STATUS_MAP } from '../constants/repair';
import { RepairFormModal } from '../components/repair/RepairFormModal';
import { RepairDetailModal } from '../components/repair/RepairDetailModal';
import { QuickImportModal } from '../components/repair/QuickImportModal';

export const RepairsPage: React.FC = () => {
  const [data, setData] = useState<RepairOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null);
  const [showQuickImport, setShowQuickImport] = useState<{ product_id: string; repair_order_id: string } | null>(null);
  
  const limit = 15;

  useEffect(() => { loadData(); }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await repairsApi.getAll({ page, limit, search });
      setData(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const handleStatusUpdate = async (id: any, status: string, note?: string) => {
    try {
      await repairsApi.update(id, { status, note });
      if (selectedOrder?.id === id) {
        const updated = await repairsApi.getById(id);
        setSelectedOrder(updated);
      }
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleCreateInvoice = async (id: any) => {
    try {
      await repairsApi.complete(id);
      alert('Sửa chữa hoàn thành. Hóa đơn đã được tạo!');
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
              placeholder="Tìm theo máy, khách hàng hoặc mã phiếu..." 
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
                <th>Thiết bị</th>
                <th>Ngày nhận</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><Wrench size={40} /><p>Chưa có phiếu sửa chữa</p></div></td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover-row">
                    <td><span className="cell-main">{item.code}</span></td>
                    <td>
                      <div className="cell-multi">
                        <span className="primary-text">{item.customer_name || 'Khách lẻ'}</span>
                        <span className="secondary-text">{item.customer_phone}</span>
                      </div>
                    </td>
                    <td>
                      <div className="cell-multi">
                        <span className="primary-text">{item.device_name}</span>
                        <span className="secondary-text">IMEI: {item.imei || '—'}</span>
                      </div>
                    </td>
                    <td>{formatFullDate(item.received_date)}</td>
                    <td><span className="price highlight">{formatPrice(item.total_amount)}</span></td>
                    <td>
                      <span className={`badge ${REPAIR_STATUS_MAP[item.status]?.color || 'badge-ghost'}`}>
                        {REPAIR_STATUS_MAP[item.status]?.label || item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => setSelectedOrder(item)} title="Xem chi tiết">
                          <Eye size={15} />
                        </button>
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
                <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p} </button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <RepairFormModal 
          onClose={() => setShowCreateModal(false)} 
          onSave={handleCreate} 
        />
      )}

      {selectedOrder && (
        <RepairDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
          onShowQuickImport={(product_id, repair_order_id) => setShowQuickImport({ product_id, repair_order_id })}
          onCreateInvoice={handleCreateInvoice}
        />
      )}

      {showQuickImport && (
        <QuickImportModal 
          product_id={showQuickImport.product_id}
          repair_order_id={showQuickImport.repair_order_id}
          onClose={() => setShowQuickImport(null)}
          onSuccess={() => {
            setShowQuickImport(null);
            loadData();
            if (selectedOrder) {
               repairsApi.getById(selectedOrder.id).then(setSelectedOrder);
            }
          }}
        />
      )}
    </div>
  );
};

export default RepairsPage;
