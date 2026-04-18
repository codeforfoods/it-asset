import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

// Seed initial admin if not exists
export async function ensureAdminExists() {
  const { data, error } = await supabase.from('app_users').select('id').eq('username', 'admin');
  if (error) console.error("Error checking admin:", error);
  
  if (!data || data.length === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin', salt);
    await supabase.from('app_users').insert([{
      username: 'admin',
      password_hash: hash,
      role: 'Admin',
      is_active: true,
      employee_code: 'ADMIN-001',
      department: 'IT Admin'
    }]);
  }
}

export async function login(username, password) {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) {
    throw new Error('Sai tên đăng nhập hoặc mật khẩu!');
  }

  if (!data.is_active) {
    throw new Error('Tài khoản đã bị khóa!');
  }

  const isValid = bcrypt.compareSync(password, data.password_hash);
  if (!isValid) {
    throw new Error('Sai tên đăng nhập hoặc mật khẩu!');
  }

  // Update last login
  await supabase.from('app_users').update({ last_login: new Date().toISOString() }).eq('id', data.id);

  // Exclude password_hash from returned user object
  const { password_hash, ...userWithoutPassword } = data;
  return userWithoutPassword;
}

export async function fetchUsers() {
  const { data, error } = await supabase
    .from('app_users')
    .select('id, username, employee_code, department, role, is_active, last_login, created_at, auth_provider')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function changeMyPassword(userId, oldPassword, newPassword) {
  // Get current user to verify old password
  const { data, error } = await supabase.from('app_users').select('password_hash').eq('id', userId).single();
  if (error || !data) throw new Error('Không tìm thấy tài khoản.');

  const isValid = bcrypt.compareSync(oldPassword, data.password_hash);
  if (!isValid) throw new Error('Mật khẩu hiện tại không chính xác!');

  // Update new password
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(newPassword, salt);
  const { error: updateError } = await supabase.from('app_users').update({ password_hash: hash }).eq('id', userId);
  if (updateError) throw updateError;
}

export async function createUser(payload) {
  // Check if username exists
  const { data: existing } = await supabase.from('app_users').select('id').eq('username', payload.username);
  if (existing && existing.length > 0) throw new Error('Tên đăng nhập đã tồn tại!');

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(payload.password, salt);

  const { password, ...rest } = payload;

  const { data, error } = await supabase
    .from('app_users')
    .insert([{ ...rest, password_hash: hash }])
    .select('id, username, employee_code, department, role, is_active, last_login, created_at, auth_provider')
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateUser(id, payload) {
  const { password, ...rest } = payload;
  let updateData = { ...rest };

  // If password is provided, hash and update it
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    updateData.password_hash = bcrypt.hashSync(password, salt);
  }

  const { data, error } = await supabase
    .from('app_users')
    .update(updateData)
    .eq('id', id)
    .select('id, username, employee_code, department, role, is_active, last_login, created_at, auth_provider')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUser(id) {
  const { error } = await supabase
    .from('app_users')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
