import api from './api';

/**
 * Translates backend/network errors into friendly Indonesian messages.
 * Never exposes raw Axios objects, Prisma errors, or stack traces.
 */
function friendlyError(err) {
  if (!err.response) {
    // Network-level error — no response from server
    return 'Tidak dapat terhubung ke server. Periksa koneksi internetmu.';
  }

  const status = err.response.status;
  const msg = err.response.data?.message || '';

  if (status === 401) return 'Email atau password salah.';
  if (status === 409 || msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exist')) {
    return 'Email sudah terdaftar. Gunakan email lain atau masuk ke akun Anda.';
  }
  if (status >= 500) return 'Terjadi kesalahan pada server. Coba lagi nanti.';
  if (status === 400 && msg) return msg;

  return 'Terjadi kesalahan. Coba lagi.';
}

/**
 * Login with email + password.
 * Returns { user, token } on success.
 * Throws a friendly string message on failure.
 */
export async function loginUser(email, password) {
  try {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data.data;
    return { user, token };
  } catch (err) {
    throw new Error(friendlyError(err));
  }
}

/**
 * Register with name + email + password.
 * Returns { user, token } on success (backend returns token on register).
 * Throws a friendly string message on failure.
 */
export async function registerUser(name, email, password) {
  try {
    const res = await api.post('/auth/register', { name, email, password });
    const { user, token } = res.data.data;
    return { user, token };
  } catch (err) {
    throw new Error(friendlyError(err));
  }
}

/**
 * Get current authenticated user profile.
 * Returns user object on success.
 */
export async function getMe() {
  try {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  } catch (err) {
    throw new Error(friendlyError(err));
  }
}
