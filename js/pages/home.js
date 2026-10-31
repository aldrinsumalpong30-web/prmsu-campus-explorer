// Home page: shows the six newest departments.
import { initLayout } from '../layout.js';
import { fetchDepartments } from '../api.js';
import { departmentCard } from '../components.js';
import { renderError } from '../utils.js';

initLayout();

const featured = document.getElementById('featured');

try {
  const departments = await fetchDepartments({ limit: 6, newestFirst: true });
  featured.innerHTML = departments.map(departmentCard).join('') || '<p>No departments yet.</p>';
} catch (error) {
  renderError(featured, error);
}
