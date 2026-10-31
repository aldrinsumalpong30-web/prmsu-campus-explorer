// Directory page: search box + category filter.
import { initLayout } from '../layout.js';
import { fetchCategories, fetchDepartments } from '../api.js';
import { departmentCard } from '../components.js';
import { escapeHtml, getParam, renderError } from '../utils.js';

initLayout();

const searchInput = document.getElementById('search');
const categorySelect = document.getElementById('category');
const results = document.getElementById('results');
const count = document.getElementById('count');

try {
  const [categories, departments] = await Promise.all([fetchCategories(), fetchDepartments()]);

  categorySelect.insertAdjacentHTML(
    'beforeend',
    categories
      .map((c) => `<option value="${c.id}">${escapeHtml(c.category_name)}</option>`)
      .join('')
  );

  // The home page search box sends the visitor here with ?q=...
  searchInput.value = getParam('q') || '';

  function render() {
    const text = searchInput.value.toLowerCase();
    const categoryId = Number(categorySelect.value);

    const matches = departments.filter((dep) => {
      const inCategory = !categoryId || dep.category_id === categoryId;
      const haystack = `${dep.department_name} ${dep.buildings?.building_name || ''}`.toLowerCase();
      return inCategory && haystack.includes(text);
    });

    count.textContent = `${matches.length} result${matches.length === 1 ? '' : 's'}`;
    results.innerHTML = matches.map(departmentCard).join('') || '<p>No results.</p>';
  }

  searchInput.addEventListener('input', render);
  categorySelect.addEventListener('change', render);
  render();
} catch (error) {
  renderError(results, error);
}
