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
        `<div class="col-4"><img class="rounded" src="${escapeHtml(img.image_path)}" alt="Department photo"></div>`
    )
    .join('');
}

function programsHtml(programs) {
  const items = (programs || '').split(/\r?\n/).filter((line) => line.trim());
  if (!items.length) return '';
  return `<h5 class="mt-4">Programs / Services</h5>
    <ul class="program-list">${items
      .map((item) => `<li><i class="fa-solid fa-circle-check"></i>${escapeHtml(item)}</li>`)
      .join('')}</ul>`;
}

function contactHtml(dep) {
  const parts = [];
  if (dep.contact_email) {
    parts.push(
      `<span><i class="fa-solid fa-envelope"></i><a href="mailto:${escapeHtml(dep.contact_email)}">${escapeHtml(dep.contact_email)}</a></span>`
    );
  }
  if (dep.contact_number) {
    parts.push(`<span><i class="fa-solid fa-phone"></i>${escapeHtml(dep.contact_number)}</span>`);
  }
  return parts.length ? `<div class="contact-row">${parts.join('')}</div>` : '';
}

function locationHtml(dep) {
  const building = dep.buildings;
  const body = building
    ? `<div id="mini-map" class="mini-map rounded"></div>
       <div class="d-flex flex-wrap gap-2 mt-3">
         <a class="btn btn-gold" target="_blank" rel="noopener"
            href="${directionsUrl(building.latitude, building.longitude)}">
           <i class="fa-solid fa-diamond-turn-right"></i> Get Directions</a>
         <a class="btn btn-outline-primary" href="map.html?dept=${encodeURIComponent(dep.slug)}">View on Map</a>
       </div>`
    : '';
  return `<h5><i class="fa-solid fa-location-dot"></i> Location</h5>
    <p class="text-muted">${escapeHtml(building?.building_name || 'No building assigned')}</p>${body}`;
}

function pageHtml(dep) {
  return `
    <nav class="small breadcrumb-nav" aria-label="breadcrumb">
      <a href="index.html">Home</a> / <a href="departments.html">Directory</a> / ${escapeHtml(dep.department_name)}
    </nav>
    <h1 class="h2 mt-2">${escapeHtml(dep.department_name)}</h1>
    <span class="badge bg-primary">${escapeHtml(dep.categories?.category_name)}</span>

    <div class="row mt-4 g-4">
      <div class="col-lg-7">
        <img class="detail-cover mb-3" src="${imageUrl(dep.image)}" alt="${escapeHtml(dep.department_name)}">
        <div class="row g-2 gallery">${galleryHtml(dep.department_images)}</div>
        <div class="panel mt-3">
          <h5>About</h5>
          <p class="preline mb-0">${escapeHtml(dep.description)}</p>
          ${programsHtml(dep.programs)}
          ${contactHtml(dep)}
        </div>
      </div>
      <div class="col-lg-5"><div class="panel side-card">${locationHtml(dep)}</div></div>
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
