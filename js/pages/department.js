// Department detail page, loaded as department.html?slug=<slug>
import { initLayout } from '../layout.js';
import { fetchDepartmentBySlug } from '../api.js';
import { createMap, addMarker } from '../mapHelpers.js';
import { escapeHtml, imageUrl, directionsUrl, getParam, renderError } from '../utils.js';

initLayout();

const container = document.getElementById('department');

function galleryHtml(images = []) {
  return images
    .map(
      (img) =>
        `<div class="col-4"><img class="img-fluid rounded" src="${escapeHtml(img.image_path)}" alt="Department photo"></div>`
    )
    .join('');
}

function programsHtml(programs) {
  const items = (programs || '').split(/\r?\n/).filter((line) => line.trim());
  if (!items.length) return '';
  return `<h5>Programs / Services</h5>
    <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function contactHtml(dep) {
  const parts = [];
  if (dep.contact_email) {
    parts.push(
      `<a href="mailto:${escapeHtml(dep.contact_email)}">${escapeHtml(dep.contact_email)}</a>`
    );
  }
  if (dep.contact_number) parts.push(escapeHtml(dep.contact_number));
  return parts.length ? `<p>${parts.join(' &nbsp; ')}</p>` : '';
}

function locationHtml(dep) {
  const building = dep.buildings;
  const body = building
    ? `<div id="mini-map" class="mini-map rounded"></div>
       <a class="btn btn-gold mt-3" target="_blank" rel="noopener"
          href="${directionsUrl(building.latitude, building.longitude)}">Get Directions</a>
       <a class="btn btn-outline-primary mt-3"
          href="map.html?dept=${encodeURIComponent(dep.slug)}">View on Map</a>`
    : '';
  return `<p><b>Building:</b> ${escapeHtml(building?.building_name || 'N/A')}</p>${body}`;
}

function pageHtml(dep) {
  return `
    <nav class="small" aria-label="breadcrumb">
      <a href="index.html">Home</a> / <a href="departments.html">Directory</a> / ${escapeHtml(dep.department_name)}
    </nav>
    <h2 class="mt-2">${escapeHtml(dep.department_name)}</h2>
    <span class="badge bg-primary">${escapeHtml(dep.categories?.category_name)}</span>

    <div class="row mt-3 g-4">
      <div class="col-md-7">
        <img class="img-fluid rounded mb-3" src="${imageUrl(dep.image)}" alt="${escapeHtml(dep.department_name)}">
        <div class="row g-2">${galleryHtml(dep.department_images)}</div>
        <p class="mt-3 preline">${escapeHtml(dep.description)}</p>
        ${programsHtml(dep.programs)}
        ${contactHtml(dep)}
      </div>
      <div class="col-md-5">${locationHtml(dep)}</div>
    </div>`;
}

try {
  const slug = getParam('slug');
  const department = slug ? await fetchDepartmentBySlug(slug) : null;

  if (!department) {
    container.innerHTML = '<h3>Department not found.</h3>';
  } else {
    document.title = `${department.department_name} | PRMSU Campus Explorer`;
    container.innerHTML = pageHtml(department);

    const building = department.buildings;
    if (building) {
      const map = createMap('mini-map', { center: [building.latitude, building.longitude], zoom: 17 });
      addMarker(map, building.latitude, building.longitude);
    }
  }
} catch (error) {
  renderError(container, error);
}
