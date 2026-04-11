import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Lock, LogIn, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, setSession } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setSession(data.session);
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng nhập. Vui lòng kiểm tra lại thông tin.');
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
          <h1>PS Manager</h1>
          <p>Hệ thống quản lý cửa hàng điện thoại & sửa chữa chuyên nghiệp</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
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

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className="input-container">
              <Lock className="input-icon-left" size={18} />
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
                <LogIn size={20} />
                <span>Đăng nhập</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-links">
          <Link to="/register" className="auth-link">
            Chưa có tài khoản? <strong>Đăng ký ngay</strong>
          </Link>
        </div>

        <div className="auth-copyright">
          <p>© 2026 Advanced Phone Shop System</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
