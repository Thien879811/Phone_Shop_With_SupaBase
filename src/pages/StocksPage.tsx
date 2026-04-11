import React, { useState } from 'react';
import { Search, AlertTriangle, Warehouse } from 'lucide-react';
import { type StockSummary } from '../services/api';
import { useStocks } from '../hooks/useInventory';

export const StocksPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 20;

  const { data: stocksData, isLoading: loading } = useStocks({ page, limit, search });
  const data = stocksData || [];
  const total = data?.length || 0;


  const handleSearch = () => { setPage(1); };
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Ton kho</h2>
          <p>Theo doi ton kho theo tung san pham</p>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Tim san pham..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Ma SP</th>
                <th>Ten san pham</th>
                <th>Danh muc</th>
                <th>Thuong hieu</th>
                <th style={{ textAlign: 'center' }}>Da nhap</th>
                <th style={{ textAlign: 'center' }}>Con lai</th>
                <th style={{ textAlign: 'center' }}>Toi thieu</th>
                <th>Tinh trang</th>
              </tr>
            </thead>
            <tbody>
              {data?.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><Warehouse size={40} /><p>Chua co du lieu ton kho</p></div></td></tr>
              ) : (
                data?.map((item: StockSummary) => (
                  <tr key={item.product_id}>
                    <td><span className="cell-main">{item.product_code}</span></td>
                    <td><span className="cell-main">{item.product_name}</span></td>
                    <td>{item.category || '-'}</td>
                    <td>{item.brand || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{item.total_imported}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: item.low_stock ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {item.total_remaining}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.min_stock}</td>
                    <td>
                      {item.low_stock ? (
                        <span className="badge badge-danger">
                          <AlertTriangle size={12} /> Sap het
                        </span>
                      ) : (
                        <span className="badge badge-success">Du hang</span>
                      )}
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
    </div>
  );
};

export default StocksPage;
