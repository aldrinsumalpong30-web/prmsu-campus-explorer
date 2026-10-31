// Shared navbar and footer, inserted on every page.
import { CONFIG } from './config.js';

const LINKS = [
  ['index.html', 'Home'],
  ['map.html', 'Campus Map'],
  ['departments.html', 'Directory'],
  ['admin.html', 'Admin'],
];

export function initLayout() {
  const current = window.location.pathname.split('/').pop() || 'index.html';

  const links = LINKS.map(
    ([href, label]) =>
      `<li class="nav-item"><a class="nav-link${href === current ? ' active' : ''}" href="${href}">${label}</a></li>`
  ).join('');

  document.body.insertAdjacentHTML(
    'afterbegin',
    `<nav class="navbar navbar-expand-lg navbar-dark navbar-prmsu sticky-top">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <i class="fa-solid fa-graduation-cap gold"></i> PRMSU Campus Explorer
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#main-nav" aria-controls="main-nav" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="main-nav">
          <ul class="navbar-nav ms-auto">${links}</ul>
        </div>
      </div>
    </nav>`
  );

  document.body.insertAdjacentHTML(
    'beforeend',
    `<footer class="footer-prmsu mt-5 py-4">
      <div class="container text-center small">
        PRMSU Campus Explorer &middot; Unofficial campus guide.
        Verify institutional details at the official PRMSU website.
      </div>
    </footer>`
  );

  if (CONFIG.SUPABASE_URL.includes('YOUR-')) {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div class="alert alert-warning m-0 rounded-0">Set your Supabase URL and anon key in js/config.js.</div>'
    );
  }
}
