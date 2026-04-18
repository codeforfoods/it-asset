import React, { useState, useEffect } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/authService';
import { validatePassword } from '../utils/passwordPolicy';
import { Loader2, Plus, Edit, Trash2, Shield, User, LogOut, KeyRound } from 'lucide-react';

const INITIAL_FORM = {
  username: '',
  password: '',
  employee_code: '',
  department: '',
  role: 'Employee',
  is_active: true,
};

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ id: null, username: '', password: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (user = null) => {
    setError(null);
    if (user) {
      setEditingId(user.id);
      setForm({ ...user, password: '' });
    } else {
      setEditingId(null);
      setForm(INITIAL_FORM);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username) return setError('Vui lòng nhập tên đăng nhập');
    if (!editingId && !form.password) return setError('Vui lòng nhập mật khẩu');

    if (form.password) {
      const pwdErrorMsg = validatePassword(form.password);
      if (pwdErrorMsg) return setError(pwdErrorMsg);
    }

    try {
      setSaving(true);
      setError(null);
      if (editingId) {
        await updateUser(editingId, form);
      } else {
        await createUser(form);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa người dùng ${name}?`)) return;
    try {
      await deleteUser(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openPwdModal = (user) => {
    setPwdError(null);
    setPwdForm({ id: user.id, username: user.username, password: '' });
    setIsPwdModalOpen(true);
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    const pwdErrorMsg = validatePassword(pwdForm.password);
    if (pwdErrorMsg) return setPwdError(pwdErrorMsg);
    
    try {
      setPwdSaving(true);
      setPwdError(null);
      await updateUser(pwdForm.id, { password: pwdForm.password });
      setIsPwdModalOpen(false);
      alert('Đã đổi mật khẩu thành công!');
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" /> Quản trị Người dùng
        </h1>
        <button onClick={() => openModal()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium shadow flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Thêm người dùng
        </button>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Tên đăng nhập</th>
                <th className="px-4 py-3 font-semibold">Mã NV</th>
                <th className="px-4 py-3 font-semibold">Phòng ban</th>
                <th className="px-4 py-3 font-semibold">Vai trò</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Lần cuối truy cập</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.employee_code}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.department}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      u.role === 'Admin' ? 'bg-rose-100 text-rose-800' :
                      u.role === 'Manager' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${u.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {u.is_active ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {u.last_login ? new Date(u.last_login).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openPwdModal(u)} className="p-1.5 text-muted-foreground hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded" title="Đổi mật khẩu"><KeyRound className="w-4 h-4" /></button>
                      <button onClick={() => openModal(u)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded" title="Chỉnh sửa"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(u.id, u.username)} disabled={u.username === 'admin'} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded disabled:opacity-30" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Sửa Người dùng' : 'Thêm Người dùng'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-2 bg-destructive/10 text-destructive text-sm rounded">{error}</div>}
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Tên đăng nhập *</label>
                <input required type="text" disabled={editingId && form.username === 'admin'} value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground" />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Mật khẩu {editingId && '(Bỏ trống nếu không đổi)'}</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Mã NV</label>
                  <input type="text" value={form.employee_code || ''} onChange={e => setForm({...form, employee_code: e.target.value})} className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Phòng ban</label>
                  <input type="text" value={form.department || ''} onChange={e => setForm({...form, department: e.target.value})} className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Vai trò</label>
                  <select disabled={form.username === 'admin'} value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground">
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 h-10 px-2 cursor-pointer">
                    <input type="checkbox" disabled={form.username === 'admin'} checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="rounded text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-sm font-medium">Đang hoạt động</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium">Hủy</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isPwdModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Đổi mật khẩu</h2>
            </div>
            
            <form onSubmit={handlePwdSubmit} className="space-y-4">
              {pwdError && <div className="p-2 bg-destructive/10 text-destructive text-sm rounded">{pwdError}</div>}
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Tài khoản</label>
                <input type="text" disabled value={pwdForm.username} className="w-full h-10 px-3 border border-input rounded-md bg-muted text-muted-foreground font-semibold" />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Mật khẩu mới *</label>
                <input required type="password" value={pwdForm.password} onChange={e => setPwdForm({...pwdForm, password: e.target.value})} className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground" placeholder="Nhập mật khẩu mới..." />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsPwdModalOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium">Hủy</button>
                <button type="submit" disabled={pwdSaving} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium flex items-center gap-2">
                  {pwdSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {pwdSaving ? 'Đang lưu...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
