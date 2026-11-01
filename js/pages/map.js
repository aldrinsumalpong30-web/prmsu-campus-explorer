// Campus map: one marker per department, with search, legend and a clickable list.
import { initLayout } from '../layout.js';
import { fetchDepartments } from '../api.js';
import { createMap, addMarker } from '../mapHelpers.js';
import { escapeHtml, imageUrl, directionsUrl, getParam, renderError } from '../utils.js';

initLayout();

const COLORS = ['#0b2d6b', '#c0392b', '#27ae60', '#f2b705', '#8e44ad'];
const colorFor = (dep) => COLORS[(dep.category_id - 1) % COLORS.length];

const section = document.getElementById('map-section');
const searchInput = document.getElementById('search');
const list = document.getElementById('list');
const legend = document.getElementById('legend');

function popupHtml(dep) {
  const { latitude, longitude } = dep.buildings;
  return `
    <div class="map-popup">
      <img src="${imageUrl(dep.image)}" alt="" class="w-100">
      <h6>${escapeHtml(dep.department_name)}</h6>
      <small>${escapeHtml(dep.buildings.building_name)} &middot; ${escapeHtml(dep.categories?.category_name)}</small>
      <p>${escapeHtml((dep.description || '').slice(0, 90))}</p>
      <a href="department.html?slug=${encodeURIComponent(dep.slug)}">View Details</a> |
      <a target="_blank" rel="noopener" href="${directionsUrl(latitude, longitude)}">Get Directions</a>
    </div>`;
}

function matches(dep, query) {
  return `${dep.department_name} ${dep.buildings.building_name}`.toLowerCase().includes(query);
}

try {
  // Only departments that have a building (and therefore coordinates) can be mapped.
  const departments = (await fetchDepartments()).filter((dep) => dep.buildings);
  const map = createMap('map', { layerControl: true });

  const markers = departments.map((dep) =>
    addMarker(map, dep.buildings.latitude, dep.buildings.longitude, colorFor(dep))
      .bindPopup(popupHtml(dep))
      .bindTooltip(dep.department_name)
  );

  if (markers.length) {
    map.fitBounds(L.featureGroup(markers).getBounds().pad(0.3), { maxZoom: 18 });
  }

  // Show only the markers and list items that match the search text.
  function render(query = '') {
    const text = query.toLowerCase();
    list.innerHTML = departments
      .map((dep, index) =>
        matches(dep, text)
          ? `<div class="col-md-4">
               <button class="btn btn-outline-primary w-100 text-start" data-index="${index}">
                 ${escapeHtml(dep.department_name)}
               </button>
             </div>`
          : ''
      )
      .join('');

    markers.forEach((marker, index) => {
      if (matches(departments[index], text)) marker.addTo(map);
      else map.removeLayer(marker);
    });
  }

  function focusDepartment(index) {
    const marker = markers[index];
    if (!marker) return;
    map.setView(marker.getLatLng(), 18);
    marker.openPopup();
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  searchInput.addEventListener('input', (event) => render(event.target.value));
  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-index]');
    if (button) focusDepartment(Number(button.dataset.index));
  });

  // One legend entry per category that appears on the map.
  const seen = new Map(departments.map((dep) => [dep.category_id, dep]));
  legend.innerHTML = [...seen.values()]
    .map(
      (dep) =>
        `<span style="color:${colorFor(dep)}">&#9679;</span> ${escapeHtml(dep.categories?.category_name)} &nbsp;`
    )
    .join('');

  render();

  // Arriving from "View on Map" opens that department's popup.
  const target = departments.findIndex((dep) => dep.slug === getParam('dept'));
  if (target >= 0) focusDepartment(target);
} catch (error) {
  renderError(section, error);
}
