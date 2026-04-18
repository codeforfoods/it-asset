import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { login, ensureAdminExists } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.login);

  useEffect(() => {
    // Ensure admin user exists on first load
    ensureAdminExists().catch(console.error);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập tài khoản và mật khẩu!');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      setAuthUser(user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 pb-6 flex flex-col items-center text-center border-b border-border bg-primary/5">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 ring-8 ring-primary/5">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground"><span className="text-primary">IT</span>Asset</h1>
          <p className="text-sm text-muted-foreground mt-2">Đăng nhập hệ thống quản lý thiết bị</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Tên đăng nhập</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-input bg-background text-foreground shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Nhập tên đăng nhập (VD: admin)"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-input bg-background text-foreground shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
