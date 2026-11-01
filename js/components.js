// Reusable HTML building blocks.
import { escapeHtml, imageUrl, directionsUrl } from './utils.js';

/** Card shown on the home page and in the directory. */
export function departmentCard(dep) {
  const building = dep.buildings;
  const slug = encodeURIComponent(dep.slug);
  const directions = building
    ? `<a class="btn btn-sm btn-outline-primary" target="_blank" rel="noopener"
          href="${directionsUrl(building.latitude, building.longitude)}">
         <i class="fa-solid fa-diamond-turn-right"></i> Directions</a>`
    : '';

  return `
    <div class="col-md-6 col-lg-4">
      <article class="dept-card">
        <div class="dept-card-media">
          <img src="${imageUrl(dep.image)}" alt="${escapeHtml(dep.department_name)}" loading="lazy">
          <span class="badge bg-primary">${escapeHtml(dep.categories?.category_name)}</span>
        </div>
        <div class="dept-card-body">
          <h5>${escapeHtml(dep.department_name)}</h5>
          <p class="small text-muted mb-0">
            <i class="fa-solid fa-location-dot"></i>
            ${escapeHtml(building?.building_name || 'No building assigned')}
          </p>
          <p class="small mb-0">${escapeHtml((dep.description || '').slice(0, 110))}</p>
          <div class="dept-card-actions">
            <a class="btn btn-sm btn-primary" href="department.html?slug=${slug}">Details</a>
            <a class="btn btn-sm btn-gold" href="map.html?dept=${slug}">
              <i class="fa-solid fa-map-pin"></i> Map</a>
            ${directions}
          </div>
        </div>
      </article>
    </div>`;
}
