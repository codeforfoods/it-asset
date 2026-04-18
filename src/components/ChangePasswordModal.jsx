import React, { useState } from 'react';
import { changeMyPassword } from '../services/authService';
import { validatePassword } from '../utils/passwordPolicy';
import { KeyRound, Loader2, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword) return setError('Vui lòng nhập mật khẩu hiện tại.');
    const pwdErrorMsg = validatePassword(newPassword);
    if (pwdErrorMsg) return setError(pwdErrorMsg);
    if (newPassword !== confirmPassword) return setError('Mật khẩu xác nhận không trùng khớp.');

    try {
      setSaving(true);
      setError('');
      await changeMyPassword(user.id, oldPassword, newPassword);
      alert('Đã đổi mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới cho lần đăng nhập sau.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <KeyRound className="w-5 h-5 text-primary" />
            Đổi mật khẩu cá nhân
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg font-medium">{error}</div>}
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Mật khẩu hiện tại</label>
            <input 
              required 
              type="password" 
              value={oldPassword} 
              onChange={e => setOldPassword(e.target.value)} 
              className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Mật khẩu mới</label>
            <input 
              required 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
              placeholder="Hoa, thường, số, đặc biệt, >=8 ký tự"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
            <input 
              required 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
