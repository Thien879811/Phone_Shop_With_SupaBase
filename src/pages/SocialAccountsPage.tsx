import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Wifi,
  Facebook,
  Search,
  X,
  CheckCircle,
  XCircle,
  Loader2,
  Globe,
  MessageCircle,
} from 'lucide-react';
import type { SocialAccount } from '../services/api';
import { 
  useSocialAccounts, 
  useCreateSocialAccount, 
  useUpdateSocialAccount, 
  useDeleteSocialAccount, 
  useTestSocialConnection 
} from '../hooks/useSocial';

const SocialAccountsPage: React.FC = () => {
  const { data: accounts = [], isLoading: loading } = useSocialAccounts();
  const createAccountM = useCreateSocialAccount();
  const updateAccountM = useUpdateSocialAccount();
  const deleteAccountM = useDeleteSocialAccount();
  const testConnectionM = useTestSocialConnection();

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [testResult, setTestResult] = useState<{ id: number; success: boolean; message: string } | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    platform: 'facebook',
    page_name: '',
    page_id: '',
    access_token: '',
    api_url: '',
  });

  const handleSubmit = async () => {
    try {
      if (editId) {
        await updateAccountM.mutateAsync({ id: editId, data: form });
      } else {
        await createAccountM.mutateAsync(form);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save account:', err);
    }
  };

  const handleEdit = (account: SocialAccount) => {
    setEditId(account.id);
    setForm({
      platform: account.platform,
      page_name: account.page_name,
      page_id: account.page_id,
      access_token: account.access_token,
      api_url: account.api_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
    try {
      await deleteAccountM.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleTestConnection = async (id: number) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const result = await testConnectionM.mutateAsync(id);
      setTestResult({ id, success: result.success, message: result.success ? 'Kết nối thành công!' : result.message });
    } catch (err: any) {
      setTestResult({ id, success: false, message: err.message || 'Lỗi kết nối' });
    } finally {
      setTestingId(null);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ platform: 'facebook', page_name: '', page_id: '', access_token: '', api_url: '' });
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const filtered = accounts.filter(
    (a) =>
      a.page_name.toLowerCase().includes(search.toLowerCase()) ||
      a.platform.toLowerCase().includes(search.toLowerCase())
  );

  const getPlatformIcon = (platform: string) => {
    if (platform === 'facebook') return <Facebook size={16} />;
    if (platform === 'zalo') return <MessageCircle size={16} />;
    return <Globe size={16} />;
  };

  const getPlatformColor = (platform: string) => {
    if (platform === 'facebook') return '#1877f2';
    if (platform === 'zalo') return '#0068ff';
    return '#6366f1';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Tài khoản mạng xã hội</h2>
          <p>Quản lý kết nối Facebook & Zalo</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Thêm tài khoản
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Globe size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Tổng tài khoản</div>
            <div className="stat-value">{accounts.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(24, 119, 242, 0.1)', color: '#1877f2' }}>
            <Facebook size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Facebook</div>
            <div className="stat-value">{accounts.filter((a) => a.platform === 'facebook').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0, 104, 255, 0.1)', color: '#0068ff' }}>
            <MessageCircle size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Zalo</div>
            <div className="stat-value">{accounts.filter((a) => a.platform === 'zalo').length}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Tìm kiếm tài khoản..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay">
            <div className="loading-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Globe size={64} />
            <p>Chưa có tài khoản mạng xã hội nào</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nền tảng</th>
                <th>Tên trang</th>
                <th>Page ID</th>
                <th>API URL</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((account) => (
                <tr key={account.id}>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: `${getPlatformColor(account.platform)}18`,
                        color: getPlatformColor(account.platform),
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {getPlatformIcon(account.platform)}
                      {account.platform === 'facebook' ? 'Facebook' : 'Zalo'}
                    </span>
                  </td>
                  <td>
                    <span className="cell-main">{account.page_name}</span>
                  </td>
                  <td>
                    <code style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{account.page_id}</code>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {account.api_url || '—'}
                  </td>
                  <td>
                    <span className={`badge ${account.status === 'ACTIVE' ? 'badge-success' : 'badge-muted'}`}>
                      {account.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {new Date(account.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-ghost btn-icon"
                        title="Test Connection"
                        onClick={() => handleTestConnection(account.id)}
                        disabled={testingId === account.id}
                      >
                        {testingId === account.id ? (
                          <Loader2 size={15} className="animate-pulse" />
                        ) : (
                          <Wifi size={15} />
                        )}
                      </button>
                      <button className="btn btn-ghost btn-icon" title="Sửa" onClick={() => handleEdit(account)}>
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        title="Xóa"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Test Connection Result Toast */}
      {testResult && (
        <div className="toast-container">
          <div className={`toast ${testResult.success ? 'toast-success' : 'toast-error'}`}>
            {testResult.success ? <CheckCircle size={18} style={{ color: 'var(--success)' }} /> : <XCircle size={18} style={{ color: 'var(--danger)' }} />}
            <span className="toast-message">{testResult.message}</span>
            <button className="toast-close" onClick={() => setTestResult(null)}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nền tảng</label>
                <select
                  className="form-input"
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                >
                  <option value="facebook">Facebook</option>
                  <option value="zalo">Zalo</option>
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tên trang</label>
                  <input
                    className="form-input"
                    placeholder="VD: PhoneShop Official"
                    value={form.page_name}
                    onChange={(e) => setForm({ ...form, page_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Page ID / OA ID</label>
                  <input
                    className="form-input"
                    placeholder="VD: 123456789"
                    value={form.page_id}
                    onChange={(e) => setForm({ ...form, page_id: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Access Token</label>
                <textarea
                  className="form-input"
                  placeholder="Nhập Access Token..."
                  value={form.access_token}
                  onChange={(e) => setForm({ ...form, access_token: e.target.value })}
                  style={{ minHeight: '80px', fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">API URL (tuỳ chọn)</label>
                <input
                  className="form-input"
                  placeholder={form.platform === 'facebook' ? 'https://graph.facebook.com' : 'https://openapi.zalo.me'}
                  value={form.api_url}
                  onChange={(e) => setForm({ ...form, api_url: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>
                Huỷ
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editId ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialAccountsPage;
