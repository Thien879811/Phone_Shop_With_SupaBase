import React, { useState, useEffect } from 'react';
import { Plus, Eye, X, ShoppingCart, Search } from 'lucide-react';
import { salesApi, type SalesInvoice } from '../services/api';
import { formatPrice, formatFullDate } from '../utils/format';
import { SalesFormModal } from '../components/SalesFormModal';

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
          <h2>Hóa đơn bán hàng</h2>
          <p>Quản lý hóa đơn bán — xuất kho theo FIFO</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-success" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Tạo hóa đơn
          </button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Tìm mã hóa đơn..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã HD</th>
                <th>Khách hàng</th>
                <th>SĐT</th>
                <th>Số SP</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><ShoppingCart size={40} /><p>Chưa có hóa đơn</p></div></td></tr>
              ) : (
                data.map((item: SalesInvoice) => (
                  <tr key={item.id}>
                    <td><span className="cell-main">{item.code}</span></td>
                    <td>{item.customer_name || 'Khách lẻ'}</td>
                    <td>{item.customer_phone || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{item.items?.length || 0}</td>
                    <td><span className="price highlight">{formatPrice(item.total_amount)}</span></td>
                    <td>
                      <span className={`badge ${item.status === 'COMPLETED' || item.status === 'CONFIRMED' ? 'badge-success' : item.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                        {item.status === 'COMPLETED' ? 'Đã hoàn thành' : (item.status === 'CONFIRMED' ? 'Đã xác nhận' : (item.status === 'CANCELLED' ? 'Đã hủy' : item.status))}
                      </span>
                    </td>
                    <td>{formatFullDate(item.created_at)}</td>
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
              <h3>Chi tiết hóa đơn - {viewItem.code}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewItem(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid" style={{ marginBottom: 20 }}>
                <div><label className="form-label">Mã HD</label><p>{viewItem.id}</p></div>
                <div><label className="form-label">Khách hàng</label><p>{viewItem.customer_name || 'Khách lẻ'}</p></div>
                <div><label className="form-label">SĐT</label><p>{viewItem.customer_phone || '-'}</p></div>
                <div><label className="form-label">Tổng tiền</label><p className="price highlight">{formatPrice(viewItem.total_amount)}</p></div>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>
                </thead>
                <tbody>
                  {viewItem.items?.map((it: any, idx: number) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{it.product_name || `#${it.product_id}`}</td>
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

export default SalesPage;
