// Small helper functions used across the site.

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/0b2d6b/f2b705?text=PRMSU';

/** Escape text before putting it into HTML (prevents XSS). */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

/** "College of Engineering" -> "college-of-engineering" */
export function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'item'
  );
}

/** Escaped image URL, or a placeholder when the department has no photo. */
export function imageUrl(path) {
  return escapeHtml(path || PLACEHOLDER_IMAGE);
}

/** Opens Google Maps directions. Plain link: no API key or billing needed. */
export function directionsUrl(latitude, longitude) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

/** Read a value from the page URL, e.g. ?slug=abc */
export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** Show an error message inside a container element. */
export function renderError(container, error) {
  console.error(error);
  container.innerHTML = `<div class="alert alert-danger">Something went wrong: ${escapeHtml(
    error?.message || error
  )}</div>`;
}
