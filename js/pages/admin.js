// Admin page: login, then a dashboard (management tools are added in later commits).
import { initLayout } from '../layout.js';
import { checkAccess, renderLogin, logout } from '../admin/auth.js';
import { escapeHtml } from '../utils.js';

initLayout();

const app = document.getElementById('app');

function showDashboard(session) {
  app.innerHTML = `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h2 class="m-0">Admin Dashboard</h2>
      <div>
        <span class="small text-muted me-2">${escapeHtml(session.user.email)}</span>
        <button id="logout" class="btn btn-sm btn-outline-danger">Logout</button>
      </div>
    </div>
    <p class="text-muted">You are logged in as an administrator.</p>`;

  document.getElementById('logout').addEventListener('click', async () => {
    await logout();
    boot();
  });
}

async function boot() {
  const access = await checkAccess();
  if (!access.ok) return renderLogin(app, boot, access.message);
  showDashboard(access.session);
}

boot();
