import React, { useState } from 'react';
import { Plus, Eye, X, Package, Search } from 'lucide-react';
import { type ImportReceipt } from '../services/api';
import { useImports, useCreateImport } from '../hooks/useInventory';
import { formatPrice, formatDate } from '../utils/format';
import { ImportFormModal } from '../components/ImportFormModal';

export const ImportsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 15;

  const { data: importsData, isLoading: loading } = useImports({ page, limit, search });
  const data = importsData?.data || [];
  const total = importsData?.total || 0;

  const createImportM = useCreateImport();

  const [showForm, setShowForm] = useState(false);
  const [viewItem, setViewItem] = useState<ImportReceipt | null>(null);

  const handleSearch = () => { setPage(1); };

  const handleCreate = async (formData: any) => {
    try {
      await createImportM.mutateAsync(formData);
      setShowForm(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi tạo phiếu nhập');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Phiếu nhập kho</h2>
          <p>Quản lý phiếu nhập hàng từ nhà cung cấp</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Tạo phiếu nhập
          </button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Tìm theo mã phiếu..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Nhà cung cấp</th>
                <th>Ngày nhập</th>
                <th>Số SP</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><Package size={40} /><p>Chưa có phiếu nhập</p></div></td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td><span className="cell-main">{item.code}</span></td>
                    <td>{item.supplier?.name || '—'}</td>
                    <td>{formatDate(item.receipt_date)}</td>
                    <td style={{ textAlign: 'center' }}>{item.items?.length || 0}</td>
                    <td><span className="price highlight">{formatPrice(item.total_amount)}</span></td>
                    <td>
                      <span className={`badge ${item.status === 'CONFIRMED' ? 'badge-success' : item.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                        {item.status === 'CONFIRMED' ? 'Đã xác nhận' : (item.status === 'CANCELLED' ? 'Đã hủy' : 'Nháp')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-icon" title="Xem" onClick={() => setViewItem(item)}><Eye size={15} /></button>
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

      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết phiếu nhập — {viewItem.code}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewItem(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid" style={{ marginBottom: 20 }}>
                <div><label className="form-label">Mã phiếu</label><p>{viewItem.code}</p></div>
                <div><label className="form-label">NCC</label><p>{viewItem.supplier?.name || '—'}</p></div>
                <div><label className="form-label">Ngày nhập</label><p>{formatDate(viewItem.receipt_date)}</p></div>
                <div><label className="form-label">Tổng tiền</label><p className="price highlight">{formatPrice(viewItem.total_amount)}</p></div>
              </div>
              <h4 style={{ marginBottom: 12, color: 'var(--text-primary)' }}>Danh sách sản phẩm</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Giá nhập</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {viewItem.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td><span className="cell-main">{it.product_name || `#${it.product_id}`}</span></td>
                      <td>{it.quantity}</td>
                      <td>{formatPrice(it.import_price)}</td>
                      <td><span className="price">{formatPrice(it.total_price || it.quantity * it.import_price)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <ImportFormModal onClose={() => setShowForm(false)} onSave={handleCreate} />
      )}
    </div>
  );
};

export default ImportsPage;
