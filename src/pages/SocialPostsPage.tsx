import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Send,
  Clock,
  Image,
  X,
  Search,
  RefreshCw,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Upload,
  Facebook,
  MessageCircle,
  Globe,
  AlertTriangle,
  RotateCcw,
  Repeat,
} from 'lucide-react';
import {
  socialPostsApi,
  socialAccountsApi,
} from '../services/api';
import type { SocialPostItem, SocialAccount } from '../services/api';

const STATUS_MAP: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  DRAFT: { label: 'Nháp', badge: 'badge-muted', icon: <FileText size={12} /> },
  SCHEDULED: { label: 'Đã lên lịch', badge: 'badge-info', icon: <Clock size={12} /> },
  POSTING: { label: 'Đang đăng', badge: 'badge-warning', icon: <Loader2 size={12} /> },
  POSTED: { label: 'Đã đăng', badge: 'badge-success', icon: <CheckCircle size={12} /> },
  FAILED: { label: 'Thất bại', badge: 'badge-danger', icon: <XCircle size={12} /> },
};

const SocialPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<SocialPostItem[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [previewPost, setPreviewPost] = useState<SocialPostItem | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    scheduledTime: '',
    platformIds: [] as number[],
    images: [] as string[],
    isRepeated: false,
    repeatInterval: 1,
  });
  const [uploadingImages, setUploadingImages] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const result = await socialPostsApi.getAll({ page, limit: 15, status: statusFilter || undefined, search: search || undefined });
      setPosts(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const data = await socialAccountsApi.getAll();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [page, statusFilter, search]);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        scheduledTime: form.scheduledTime || undefined,
      };
      if (editId) {
        await socialPostsApi.update(editId, payload);
      } else {
        await socialPostsApi.create(payload);
      }
      setShowModal(false);
      resetForm();
      loadPosts();
    } catch (err) {
      console.error('Failed to save post:', err);
    }
  };

  const handleEdit = (post: SocialPostItem) => {
    setEditId(post.id);
    setForm({
      title: post.title,
      content: post.content,
      scheduledTime: post.scheduledTime ? new Date(post.scheduledTime).toISOString().slice(0, 16) : '',
      platformIds: post.platforms?.map((p) => p.accountId) || [],
      images: post.images?.map((img) => img.imageUrl) || [],
      isRepeated: post.isRepeated || false,
      repeatInterval: post.repeatInterval || 1,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa bài đăng này?')) return;
    try {
      await socialPostsApi.delete(id);
      loadPosts();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handlePublish = async (id: number) => {
    setActionLoading(id);
    try {
      await socialPostsApi.publish(id);
      loadPosts();
    } catch (err) {
      console.error('Failed to publish:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetry = async (id: number) => {
    setActionLoading(id);
    try {
      await socialPostsApi.retry(id);
      loadPosts();
    } catch (err) {
      console.error('Failed to retry:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRepost = async (id: number) => {
    if (!confirm('Bạn có muốn đăng lại bài viết này ngay bây giờ?')) return;
    setActionLoading(id);
    try {
      await socialPostsApi.repost(id);
      loadPosts();
    } catch (err) {
      console.error('Failed to repost:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImages(true);
    try {
      const files = Array.from(e.target.files);
      const result = await socialPostsApi.uploadImages(files);
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...result.map(r => r.imageUrl)],
      }));
    } catch (err) {
      console.error('Failed to upload images:', err);
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const togglePlatform = (accountId: number) => {
    setForm((prev) => ({
      ...prev,
      platformIds: prev.platformIds.includes(accountId)
        ? prev.platformIds.filter((id) => id !== accountId)
        : [...prev.platformIds, accountId],
    }));
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ title: '', content: '', scheduledTime: '', platformIds: [], images: [], isRepeated: false, repeatInterval: 1 });
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'facebook') return <Facebook size={13} />;
    if (platform === 'zalo') return <MessageCircle size={13} />;
    return <Globe size={13} />;
  };

  const getPlatformColor = (platform: string) => {
    if (platform === 'facebook') return '#1877f2';
    if (platform === 'zalo') return '#0068ff';
    return '#6366f1';
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Đăng bài tự động</h2>
          <p>Quản lý và lên lịch đăng bài lên Facebook & Zalo</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Tạo bài viết
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <FileText size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Tổng bài viết</div>
            <div className="stat-value">{total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Đã lên lịch</div>
            <div className="stat-value">{posts.filter((p) => p.status === 'SCHEDULED').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Đã đăng</div>
            <div className="stat-value">{posts.filter((p) => p.status === 'POSTED').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <XCircle size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Thất bại</div>
            <div className="stat-value">{posts.filter((p) => p.status === 'FAILED').length}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <div className="data-table-header">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="data-table-filters">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="DRAFT">Nháp</option>
              <option value="SCHEDULED">Đã lên lịch</option>
              <option value="POSTING">Đang đăng</option>
              <option value="POSTED">Đã đăng</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay">
            <div className="loading-spinner" />
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} />
            <p>Chưa có bài viết nào</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Trạng thái</th>
                <th>Lịch đăng</th>
                <th>Nền tảng</th>
                <th>Hình ảnh</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const statusInfo = STATUS_MAP[post.status] || STATUS_MAP.DRAFT;
                return (
                  <tr key={post.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{post.id}</td>
                    <td>
                      <div className="cell-main">{post.title}</div>
                      <div className="cell-sub" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.content}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statusInfo.badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                      {post.isRepeated && (
                        <div style={{ marginTop: '4px' }}>
                          <span className="badge badge-info" style={{ fontSize: '10px', gap: '3px' }}>
                            <Repeat size={10} /> Lặp lại {post.repeatInterval} ngày
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {post.scheduledTime
                        ? new Date(post.scheduledTime).toLocaleString('vi-VN')
                        : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {post.platforms?.map((pp) => (
                          <span
                            key={pp.id}
                            className="badge"
                            style={{
                              background: `${getPlatformColor(pp.account?.platform)}18`,
                              color: getPlatformColor(pp.account?.platform),
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '10px',
                            }}
                            title={`Status: ${pp.status}`}
                          >
                            {getPlatformIcon(pp.account?.platform)}
                            {pp.account?.pageName}
                            {pp.status === 'POSTED' && <CheckCircle size={10} />}
                            {pp.status === 'FAILED' && <XCircle size={10} />}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {post.images && post.images.length > 0 ? (
                        <span className="badge badge-primary">
                          <Image size={11} /> {post.images.length}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon" title="Xem" onClick={() => setPreviewPost(post)}>
                          <Eye size={15} />
                        </button>
                        {(post.status === 'DRAFT' || post.status === 'SCHEDULED') && (
                          <>
                            <button className="btn btn-ghost btn-icon" title="Sửa" onClick={() => handleEdit(post)}>
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="btn btn-ghost btn-icon"
                              title="Đăng ngay"
                              style={{ color: 'var(--success)' }}
                              onClick={() => handlePublish(post.id)}
                              disabled={actionLoading === post.id}
                            >
                              {actionLoading === post.id ? <Loader2 size={15} className="animate-pulse" /> : <Send size={15} />}
                            </button>
                          </>
                        )}
                        {post.status === 'FAILED' && (
                          <button
                            className="btn btn-ghost btn-icon"
                            title="Thử lại"
                            style={{ color: 'var(--warning)' }}
                            onClick={() => handleRetry(post.id)}
                            disabled={actionLoading === post.id}
                          >
                            {actionLoading === post.id ? <Loader2 size={15} className="animate-pulse" /> : <RefreshCw size={15} />}
                          </button>
                        )}
                        {post.status === 'POSTED' && (
                          <button
                            className="btn btn-ghost btn-icon"
                            title="Đăng lại"
                            style={{ color: 'var(--blue)' }}
                            onClick={() => handleRepost(post.id)}
                            disabled={actionLoading === post.id}
                          >
                            {actionLoading === post.id ? <Loader2 size={15} className="animate-pulse" /> : <RotateCcw size={15} />}
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Xóa"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="table-pagination">
            <span>Hiển thị {posts.length} / {total} bài viết</span>
            <div className="pagination-btns">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewPost && (
        <div className="modal-overlay" onClick={() => setPreviewPost(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xem trước bài đăng</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setPreviewPost(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{previewPost.title}</h4>
                <div
                  style={{
                    padding: '16px',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap',
                    fontSize: '14px',
                  }}
                >
                  {previewPost.content}
                </div>
              </div>

              {/* Images */}
              {previewPost.images && previewPost.images.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">Hình ảnh</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                    {previewPost.images.map((img) => (
                      <div
                        key={img.id}
                        style={{
                          aspectRatio: '1',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <img
                          src={`http://localhost:3000${img.imageUrl}`}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform statuses */}
              <div>
                <label className="form-label">Trạng thái nền tảng</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {previewPost.platforms?.map((pp) => {
                    const ppStatus = STATUS_MAP[pp.status] || { label: pp.status, badge: 'badge-muted', icon: null };
                    return (
                      <div
                        key={pp.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: 'var(--bg-input)',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: getPlatformColor(pp.account?.platform) }}>
                            {getPlatformIcon(pp.account?.platform)}
                          </span>
                          <span style={{ fontWeight: 500 }}>{pp.account?.pageName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`badge ${ppStatus.badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {ppStatus.icon} {ppStatus.label}
                          </span>
                          {pp.postedAt && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {new Date(pp.postedAt).toLocaleString('vi-VN')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Error responses */}
              {previewPost.platforms?.some((pp) => pp.status === 'FAILED' && pp.response) && (
                <div style={{ marginTop: '16px' }}>
                  <label className="form-label" style={{ color: 'var(--danger)' }}>
                    <AlertTriangle size={12} style={{ marginRight: '4px' }} /> Lỗi
                  </label>
                  {previewPost.platforms
                    .filter((pp) => pp.status === 'FAILED' && pp.response)
                    .map((pp) => (
                      <pre
                        key={pp.id}
                        style={{
                          padding: '12px',
                          background: 'var(--danger-bg)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '11px',
                          color: 'var(--danger)',
                          overflow: 'auto',
                          maxHeight: '120px',
                        }}
                      >
                        {pp.response}
                      </pre>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Sửa bài viết' : 'Tạo bài viết mới'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Tiêu đề</label>
                <input
                  className="form-input"
                  placeholder="VD: Khuyến mãi cuối tuần"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nội dung</label>
                <textarea
                  className="form-input"
                  placeholder="Soạn nội dung bài viết..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  style={{ minHeight: '140px' }}
                />
                <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {form.content.length} ký tự
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label className="form-label">Hình ảnh</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  {form.images.map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        width: '80px',
                        height: '80px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <img
                        src={`http://localhost:3000${url}`}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0,0,0,0.7)',
                          border: 'none',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          color: '#fff',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImages}
                    style={{
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      background: 'var(--bg-input)',
                      border: '2px dashed var(--border)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      fontSize: '10px',
                      transition: 'var(--transition)',
                    }}
                  >
                    {uploadingImages ? <Loader2 size={18} className="animate-pulse" /> : <Upload size={18} />}
                    {uploadingImages ? 'Đang tải...' : 'Tải ảnh'}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </div>

              {/* Platform Selection */}
              <div className="form-group">
                <label className="form-label">Chọn nền tảng đăng</label>
                {accounts.length === 0 ? (
                  <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Chưa có tài khoản nào. Hãy thêm tài khoản mạng xã hội trước.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {accounts.map((acc) => {
                      const selected = form.platformIds.includes(acc.id);
                      return (
                        <button
                          key={acc.id}
                          onClick={() => togglePlatform(acc.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: `2px solid ${selected ? getPlatformColor(acc.platform) : 'var(--border)'}`,
                            background: selected ? `${getPlatformColor(acc.platform)}14` : 'var(--bg-input)',
                            color: selected ? getPlatformColor(acc.platform) : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            fontFamily: 'var(--font)',
                            transition: 'var(--transition)',
                          }}
                        >
                          {getPlatformIcon(acc.platform)}
                          {acc.pageName}
                          {selected && <CheckCircle size={14} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Schedule Time */}
              <div className="form-group">
                <label className="form-label">Lịch đăng (tuỳ chọn)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={form.scheduledTime}
                    onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  {form.scheduledTime && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, scheduledTime: '' })}>
                      <X size={14} /> Xoá lịch
                    </button>
                  )}
                </div>
              </div>

              {/* Repeat Settings */}
              <div className="form-group" style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: form.isRepeated ? '12px' : '0' }}>
                  <input
                    type="checkbox"
                    checked={form.isRepeated}
                    onChange={(e) => setForm({ ...form, isRepeated: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Repeat size={16} />
                    <span style={{ fontWeight: 600 }}>Tự động lặp lại bài đăng này</span>
                  </div>
                </label>
                
                {form.isRepeated && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '28px', animation: 'fadeIn 0.2s ease' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Lặp lại sau mỗi:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        className="form-input"
                        style={{ width: '70px', textAlign: 'center' }}
                        value={form.repeatInterval}
                        onChange={(e) => setForm({ ...form, repeatInterval: parseInt(e.target.value) || 1 })}
                      />
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>ngày</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>
                Huỷ
              </button>
              <button className="btn btn-outline" onClick={handleSubmit}>
                <FileText size={14} /> Lưu nháp
              </button>
              {form.scheduledTime ? (
                <button className="btn btn-primary" onClick={handleSubmit}>
                  <Clock size={14} /> Lên lịch
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    try {
                      let postId = editId;
                      const payload = { ...form, scheduledTime: undefined };
                      if (editId) {
                        await socialPostsApi.update(editId, payload);
                      } else {
                        const created = await socialPostsApi.create(payload);
                        postId = created.id;
                      }
                      if (postId) {
                        await socialPostsApi.publish(postId);
                      }
                      setShowModal(false);
                      resetForm();
                      loadPosts();
                    } catch (err) {
                      console.error('Failed to publish:', err);
                    }
                  }}
                >
                  <Send size={14} /> Đăng ngay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPostsPage;
