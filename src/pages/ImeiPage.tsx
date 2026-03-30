import React from 'react';
import { Smartphone } from 'lucide-react';

export const ImeiPage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Quan ly IMEI</h2>
          <p>Theo doi IMEI / serial number cua tung may</p>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="empty-state" style={{ padding: '80px 20px' }}>
          <Smartphone size={64} />
          <h3 style={{ marginTop: 16, color: 'var(--text-primary)', fontWeight: 600 }}>Tinh nang IMEI</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 400, textAlign: 'center', marginTop: 8 }}>
            IMEI duoc tu dong tao khi nhap kho (neu ban cung cap danh sach IMEI trong phieu nhap).
            Khi ban hang, trang thai IMEI se tu dong cap nhat sang SOLD.
          </p>
          <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 12 }}>
            Trang thai: IN_STOCK - SOLD - RETURNED - WARRANTY
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImeiPage;
