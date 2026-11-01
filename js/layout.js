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

  const footerLinks = LINKS.filter(([href]) => href !== 'admin.html')
    .map(([href, label]) => `<li class="mb-1"><a href="${href}">${label}</a></li>`)
    .join('');

  document.body.insertAdjacentHTML(
    'afterbegin',
    `<nav class="navbar navbar-expand-lg navbar-prmsu sticky-top">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2" href="index.html">
          <span class="brand-mark"><i class="fa-solid fa-graduation-cap"></i></span>
          <span class="brand-text">PRMSU<small>Campus Explorer</small></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#main-nav" aria-controls="main-nav" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="main-nav">
          <ul class="navbar-nav ms-auto gap-lg-1">${links}</ul>
        </div>
      </div>
    </nav>`
  );

  document.body.insertAdjacentHTML(
    'beforeend',
    `<footer class="footer-prmsu mt-5">
      <div class="container py-5">
        <div class="row g-4">
          <div class="col-md-6">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="brand-mark"><i class="fa-solid fa-graduation-cap"></i></span>
              <strong>PRMSU Campus Explorer</strong>
            </div>
            <p class="small footer-muted mb-0">
              An unofficial campus guide. Verify institutional details at the official PRMSU website.
            </p>
          </div>
          <div class="col-6 col-md-3">
            <h6>Explore</h6>
            <ul class="list-unstyled small mb-0">${footerLinks}</ul>
          </div>
          <div class="col-6 col-md-3">
            <h6>Manage</h6>
            <ul class="list-unstyled small mb-0"><li><a href="admin.html">Admin login</a></li></ul>
          </div>
        </div>
        <hr class="footer-rule my-4">
        <div class="small footer-muted">&copy; ${new Date().getFullYear()} PRMSU Campus Explorer &middot; Elec 3 final project</div>
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
