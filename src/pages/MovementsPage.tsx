import React, { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, RotateCcw, Settings, History } from 'lucide-react';
import { useMovements } from '../hooks/useInventory';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const movementMeta: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  IMPORT: { icon: <ArrowDownCircle size={16} />, color: 'var(--success)', bg: 'var(--success-bg)', label: 'Nhập kho' },
  SALE: { icon: <ArrowUpCircle size={16} />, color: 'var(--danger)', bg: 'var(--danger-bg)', label: 'Bán hàng' },
  RETURN: { icon: <RotateCcw size={16} />, color: 'var(--warning)', bg: 'var(--warning-bg)', label: 'Trả hàng' },
  ADJUST: { icon: <Settings size={16} />, color: 'var(--info)', bg: 'var(--info-bg)', label: 'Điều chỉnh' },
  TRANSFER: { icon: <ArrowDownCircle size={16} />, color: 'var(--primary-light)', bg: 'var(--primary-bg)', label: 'Chuyển kho' },
};

export const MovementsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const limit = 20;

  const { data: moveData, isLoading: loading } = useMovements({ page, limit, movement_type: filter || undefined });
  const data = moveData?.data || [];
  const total = moveData?.total || 0;

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Lịch sử kho</h2>
          <p>Tất cả hoạt động nhập / xuất / điều chỉnh kho</p>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div className="data-table-filters">
            <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} style={{ minWidth: 160 }}>
              <option value="">Tất cả loại</option>
              <option value="IMPORT">Nhập kho</option>
              <option value="SALE">Bán hàng</option>
              <option value="RETURN">Trả hàng</option>
              <option value="ADJUST">Điều chỉnh</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Sản phẩm</th>
                <th>Loại</th>
                <th>Mã tham chiếu</th>
                <th style={{ textAlign: 'center' }}>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><History size={40} /><p>Chưa có lịch sử</p></div></td></tr>
              ) : (
                data.map((item) => {
                  const meta = movementMeta[item.movement_type] || movementMeta.ADJUST;
                  return (
                    <tr key={item.id}>
                      <td>{formatDate(item.created_at)}</td>
                      <td><span className="cell-main">{item.product_name || `#${item.product_id}`}</span></td>
                      <td>
                        <span className="badge" style={{ background: meta.bg, color: meta.color }}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td>{item.reference_code || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: item.quantity >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {item.quantity >= 0 ? '+' : ''}{item.quantity}
                        </span>
                      </td>
                    </tr>
                  );
                })
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
    </div>
  );
};

export default MovementsPage;
