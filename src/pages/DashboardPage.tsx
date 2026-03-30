import React, { useState, useEffect } from 'react';
import {
  Package, TrendingUp, AlertTriangle, ArrowDownCircle, ArrowUpCircle,
  RotateCcw, Settings, Boxes
} from 'lucide-react';
import { stocksApi, type DashboardStats, type StockMovement } from '../services/api';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const movementIcons: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  IMPORT: { icon: <ArrowDownCircle size={16} />, color: 'var(--success)', bg: 'var(--success-bg)' },
  SALE: { icon: <ArrowUpCircle size={16} />, color: 'var(--danger)', bg: 'var(--danger-bg)' },
  RETURN: { icon: <RotateCcw size={16} />, color: 'var(--warning)', bg: 'var(--warning-bg)' },
  ADJUST: { icon: <Settings size={16} />, color: 'var(--info)', bg: 'var(--info-bg)' },
};

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stocksApi.getDashboard();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Dashboard</h2>
          <p>Tổng quan quản lý kho cửa hàng điện thoại</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Package size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Sản phẩm trong kho</div>
            <div className="stat-value">{stats?.totalProducts ?? 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Boxes size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Tổng tồn kho</div>
            <div className="stat-value">{(stats?.totalStock ?? 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <AlertTriangle size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Sắp hết hàng</div>
            <div className="stat-value">{stats?.lowStockCount ?? 0}</div>
            {(stats?.lowStockCount ?? 0) > 0 && (
              <div className="stat-change negative">⚠ Cần nhập thêm</div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <TrendingUp size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Hoạt động gần đây</div>
            <div className="stat-value">{stats?.recentMovements?.length ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="dashboard-grid">
        <div className="chart-card full-width">
          <h4>📦 Hoạt động kho gần đây</h4>
          {(stats?.recentMovements?.length ?? 0) === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <p>Chưa có hoạt động nào</p>
            </div>
          ) : (
            <div className="movement-list">
              {stats?.recentMovements?.map((m: StockMovement) => {
                const meta = movementIcons[m.movementType] || movementIcons.ADJUST;
                return (
                  <div className="movement-item" key={m.id}>
                    <div
                      className="movement-icon"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {meta.icon}
                    </div>
                    <div className="movement-info">
                      <div className="movement-title">{m.productName || `Product #${m.productId}`}</div>
                      <div className="movement-meta">
                        {m.referenceCode && <span>{m.referenceCode} · </span>}
                        {m.movementType} · {formatDate(m.createdAt)}
                      </div>
                    </div>
                    <div className={`movement-qty ${m.quantity >= 0 ? 'positive' : 'negative'}`}>
                      {m.quantity >= 0 ? '+' : ''}{m.quantity}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
