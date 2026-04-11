import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Lock, UserPlus, ShieldCheck, AlertCircle, User, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      
      if (data.session) {
        alert('Đăng ký thành công!');
        navigate('/');
      } else {
        alert('Vui lòng kiểm tra email để xác nhận tài khoản.');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng ký. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <ShieldCheck size={32} />
          </div>
          <h1>Tạo tài khoản</h1>
          <p>Bắt đầu quản lý thông minh ngay hôm nay</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <div className="input-container">
              <User className="input-icon-left" size={18} />
              <input
                type="text"
                className="auth-input"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-container">
              <Mail className="input-icon-left" size={18} />
              <input
                type="email"
                className="auth-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div className="input-container">
                <Lock className="input-icon-left" size={18} />
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  style={{ paddingLeft: '48px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận</label>
              <div className="input-container">
                <Lock className="input-icon-left" size={18} />
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  style={{ paddingLeft: '48px' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? (
              <div className="loading-spinner-sm" />
            ) : (
              <>
                <UserPlus size={20} />
                <span>Đăng ký tham gia</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-links">
          <Link to="/login" className="auth-link">
            <ArrowLeft size={16} />
            <span>Quay lại <strong>Đăng nhập</strong></span>
          </Link>
        </div>

        <div className="auth-copyright">
          <p>© 2026 Advanced Phone Shop System</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
