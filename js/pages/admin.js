// Admin page: login, then tabs for managing buildings and categories.
import { initLayout } from '../layout.js';
import { checkAccess, renderLogin, logout } from '../admin/auth.js';
import { renderLookup } from '../admin/lookups.js';
import { escapeHtml } from '../utils.js';

initLayout();

const app = document.getElementById('app');

const TABS = [
  { id: 'buildings', label: 'Buildings', render: (el) => renderLookup(el, 'buildings') },
  { id: 'categories', label: 'Categories', render: (el) => renderLookup(el, 'categories') },
];
let activeTab = TABS[0].id;

function showDashboard(session) {
  app.innerHTML = `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h2 class="m-0">Admin Dashboard</h2>
      <div>
        <span class="small text-muted me-2">${escapeHtml(session.user.email)}</span>
        <button id="logout" class="btn btn-sm btn-outline-danger">Logout</button>
      </div>
    </div>
    <div id="tabs" class="mb-3"></div>
    <div id="tab-content"></div>`;

  document.getElementById('logout').addEventListener('click', async () => {
    await logout();
    boot();
  });
  showTab(activeTab);
}

function showTab(id) {
  activeTab = id;
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = TABS.map(
    (tab) =>
      `<button class="btn btn-sm ${tab.id === id ? 'btn-primary' : 'btn-outline-primary'}" data-tab="${tab.id}">${tab.label}</button>`
  ).join(' ');
  tabs.onclick = (event) => {
    const button = event.target.closest('[data-tab]');
    if (button) showTab(button.dataset.tab);
  };
  TABS.find((tab) => tab.id === id).render(document.getElementById('tab-content'));
}

async function boot() {
  const access = await checkAccess();
  if (!access.ok) return renderLogin(app, boot, access.message);
  showDashboard(access.session);
}

boot();
