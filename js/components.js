// Reusable HTML building blocks.
import { escapeHtml, imageUrl, directionsUrl } from './utils.js';

/** Card shown on the home page and in the directory. */
export function departmentCard(dep) {
  const building = dep.buildings;
  const slug = encodeURIComponent(dep.slug);
  const directions = building
    ? `<a class="btn btn-sm btn-outline-success" target="_blank" rel="noopener"
          href="${directionsUrl(building.latitude, building.longitude)}">Directions</a>`
    : '';

  return `
    <div class="col-md-4">
      <div class="card h-100">
        <img class="card-img-top" src="${imageUrl(dep.image)}" alt="${escapeHtml(dep.department_name)}">
        <div class="card-body">
          <span class="badge bg-primary">${escapeHtml(dep.categories?.category_name)}</span>
          <h5 class="mt-2">${escapeHtml(dep.department_name)}</h5>
          <p class="small text-muted">
            <i class="fa-solid fa-location-dot"></i>
            ${escapeHtml(building?.building_name || 'No building assigned')}
          </p>
          <p class="small">${escapeHtml((dep.description || '').slice(0, 110))}</p>
          <a class="btn btn-sm btn-outline-primary" href="department.html?slug=${slug}">Details</a>
          <a class="btn btn-sm btn-gold" href="map.html?dept=${slug}">View on Map</a>
          ${directions}
        </div>
      </div>
    </div>`;
}
