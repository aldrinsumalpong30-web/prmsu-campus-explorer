// Leaflet + OpenStreetMap helpers (free: no API key or billing account).
// `L` is the global created by the Leaflet <script> tag in the HTML page.
import { CONFIG } from './config.js';

const STREET_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const SATELLITE_TILES =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

/** Create a map inside the element with the given id. */
export function createMap(
  elementId,
  { center = [CONFIG.MAP_LAT, CONFIG.MAP_LNG], zoom = CONFIG.MAP_ZOOM, layerControl = false } = {}
) {
  const map = L.map(elementId).setView(center, zoom);

  const street = L.tileLayer(STREET_TILES, {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  if (layerControl) {
    const satellite = L.tileLayer(SATELLITE_TILES, {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri',
    });
    L.control.layers({ Map: street, Satellite: satellite }).addTo(map);
  }
  return map;
}

/** Add a round colored marker and return it. */
export function addMarker(map, latitude, longitude, color = '#0b2d6b') {
  return L.circleMarker([latitude, longitude], {
    radius: 9,
    fillColor: color,
    fillOpacity: 1,
    color: '#ffffff',
    weight: 2,
  }).addTo(map);
}
