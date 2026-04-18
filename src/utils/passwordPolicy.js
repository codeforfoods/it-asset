export function validatePassword(password) {
  if (!password) return 'Mật khẩu không được để trống.';
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.';
  if (!/[A-Z]/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z).';
  if (!/[a-z]/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ thường (a-z).';
  if (!/[0-9]/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9).';
  if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.';
  return null; // Valid
}
