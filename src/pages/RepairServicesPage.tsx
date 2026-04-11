import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Search, List } from 'lucide-react';
import { type RepairService } from '../services/api';
import { useRepairServices, useCreateRepairService, useUpdateRepairService, useDeleteRepairService } from '../hooks/useRepairs';
import { useProducts } from '../hooks/useProducts';
import { formatPrice } from '../utils/format';
import { ServiceFormModal } from '../components/repair/ServiceFormModal';

export const RepairServicesPage: React.FC = () => {
  const { data = [], isLoading: loading } = useRepairServices();
  const { data: productsData } = useProducts({ limit: 500 });
  const products = productsData?.data || [];

  const createServiceM = useCreateRepairService();
  const updateServiceM = useUpdateRepairService();
  const deleteServiceM = useDeleteRepairService();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>(null);

  const handleOpenCreate = () => {
    setEditingId(null);
    setEditingData({
      name: '',
      service_type: 'REPAIR',
      default_price: 0,
      product_id: undefined,
      description: '',
      status: 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleEdit = (item: RepairService) => {
    setEditingId(item.id);
    setEditingData({
      name: item.name,
      service_type: item.service_type,
      default_price: item.default_price,
      product_id: item.product_id,
      description: item.description || '',
      status: item.status
    });
    setShowModal(true);
  };

  const handleSave = async (formData: any) => {
    try {
      if (editingId) {
        await updateServiceM.mutateAsync({ id: editingId, data: formData });
      } else {
        await createServiceM.mutateAsync(formData);
      }
      setShowModal(false);
    } catch (err) { alert('Lỗi lưu dịch vụ'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
    try {
      await deleteServiceM.mutateAsync(id);
    } catch (err) { alert('Không thể xóa dịch vụ này (có thể đã được sử dụng)'); }
  };

  const filteredData = data.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="services-page">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Danh mục dịch vụ</h2>
          <p>Quản lý các loại dịch vụ sửa chữa chuẩn của cửa hàng</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Thêm dịch vụ
          </button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Tìm tên dịch vụ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên dịch vụ</th>
                <th>Loại</th>
                <th>Liên kết sản phẩm</th>
                <th>Giá mặc định</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><List size={40} /><p>Chưa có dịch vụ nào</p></div></td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td><span className="cell-main">{item.name}</span></td>
                    <td>
                      <span className={`badge badge-sm ${item.service_type === 'REPLACEMENT' ? 'badge-info' : 'badge-ghost'}`}>
                        {item.service_type === 'REPLACEMENT' ? 'Thay linh kiện' : 'Dịch vụ sửa'}
                      </span>
                    </td>
                    <td>
                      {item.product_id ? (
                        <div className="cell-multi">
                          <span className="primary-text">{products.find(p => p.id === item.product_id)?.name || 'Sản phẩm ID: ' + item.product_id}</span>
                          <br />
                          <span className="secondary-text">Code: {products.find(p => p.id === item.product_id)?.code || '—'}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td><span className="price highlight">{formatPrice(item.default_price)}</span></td>
                    <td>
                      <span className={`badge ${item.status === 'ACTIVE' ? 'badge-success' : 'badge-ghost'}`}>
                        {item.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-icon" title="Sửa" onClick={() => handleEdit(item)}>
                          <Edit2 size={14} color="var(--primary)" />
                        </button>
                        <button className="btn btn-ghost btn-icon" title="Xóa" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={14} color="var(--danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <ServiceFormModal
          editingId={editingId}
          products={products}
          initialData={editingData}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default RepairServicesPage;
