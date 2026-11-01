// Admin authentication: Supabase Auth login + a check against the `admins` table.
import { supabase } from '../supabaseClient.js';
import { escapeHtml } from '../utils.js';

/**
 * Returns { ok: true, session } for a logged-in admin.
 * A logged-in user who is NOT listed in `admins` is signed out again.
 */
export async function checkAccess() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false };

  // Row Level Security only lets a user see their own row in `admins`.
  const { data: admin } = await supabase.from('admins').select('user_id').maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { ok: false, message: 'This account is not an administrator.' };
  }
  return { ok: true, session };
}

export async function logout() {
  await supabase.auth.signOut();
}

/** Draw the login form. Calls onSuccess() after a successful login. */
export function renderLogin(container, onSuccess, message = '') {
  container.innerHTML = `
    <div class="login-box">
      <h3>Admin Login</h3>
      ${message ? `<div class="alert alert-danger">${escapeHtml(message)}</div>` : ''}
      <form id="login-form">
        <input name="email" type="email" class="form-control mb-2" placeholder="Email" required>
        <input name="password" type="password" class="form-control mb-3" placeholder="Password" required>
        <button class="btn btn-gold w-100">Login</button>
      </form>
    </div>`;

  document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.get('email'),
      password: form.get('password'),
    });
    if (error) renderLogin(container, onSuccess, error.message);
    else onSuccess();
  });
}
