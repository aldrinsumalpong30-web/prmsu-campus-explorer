// Create / Read / Update / Delete for the two simple tables: categories and buildings.
import { supabase } from '../supabaseClient.js';
import { escapeHtml, renderError } from '../utils.js';

const RESOURCES = {
  categories: {
    table: 'categories',
    singular: 'Category',
    primary: 'category_name',
    fields: [
      { name: 'category_name', label: 'Category name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'text', required: false },
    ],
  },
  buildings: {
    table: 'buildings',
    singular: 'Building',
    primary: 'building_name',
    fields: [
      { name: 'building_name', label: 'Building name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'text', required: false },
      { name: 'latitude', label: 'Latitude', type: 'number', required: true, min: -90, max: 90 },
      { name: 'longitude', label: 'Longitude', type: 'number', required: true, min: -180, max: 180 },
    ],
  },
};

/** Render the form + table for `categories` or `buildings` inside container. */
export async function renderLookup(container, key) {
  const resource = RESOURCES[key];
  let editingId = null;

  function formHtml(row) {
    const inputs = resource.fields
      .map((field) => {
        const attrs = [
          field.required ? 'required' : '',
          field.type === 'number' ? 'step="any"' : '',
          field.min !== undefined ? `min="${field.min}"` : '',
          field.max !== undefined ? `max="${field.max}"` : '',
        ].join(' ');
        return `
          <div class="col-md">
            <label class="form-label small">${field.label}</label>
            <input class="form-control" name="${field.name}" type="${field.type}" ${attrs}
                   value="${escapeHtml(row[field.name])}">
          </div>`;
      })
      .join('');

    return `
      <form id="lookup-form" class="row g-2 align-items-end bg-white p-3 rounded mb-3">
        ${inputs}
        <div class="col-auto">
          <button type="submit" class="btn btn-gold">${row.id ? 'Update' : 'Add'} ${resource.singular}</button>
          ${row.id ? '<button type="button" class="btn btn-link" data-cancel>Cancel</button>' : ''}
        </div>
      </form>`;
  }

  function tableHtml(rows) {
    const isBuilding = key === 'buildings';
    const body = rows
      .map(
        (row) => `
        <tr>
          <td>${escapeHtml(row[resource.primary])}</td>
          ${isBuilding ? `<td>${row.latitude}, ${row.longitude}</td>` : ''}
          <td class="text-end text-nowrap">
            ${
              isBuilding
                ? `<a class="btn btn-sm btn-outline-secondary" target="_blank" rel="noopener"
                      href="https://www.openstreetmap.org/?mlat=${row.latitude}&mlon=${row.longitude}#map=18/${row.latitude}/${row.longitude}">Preview</a>`
                : ''
            }
            <button class="btn btn-sm btn-outline-primary" data-edit="${row.id}">Edit</button>
            <button class="btn btn-sm btn-outline-danger" data-delete="${row.id}">Delete</button>
          </td>
        </tr>`
      )
      .join('');
    return `<div class="table-responsive"><table class="table bg-white align-middle">${body}</table></div>`;
  }

  async function save(form) {
    const data = new FormData(form);
    const row = {};
    resource.fields.forEach((field) => {
      const value = data.get(field.name);
      row[field.name] = field.type === 'number' ? Number(value) : value.trim();
    });

    const query = editingId
      ? supabase.from(resource.table).update(row).eq('id', editingId) // UPDATE
      : supabase.from(resource.table).insert(row); // CREATE
    const { error } = await query;
    if (error) return alert(error.message);

    editingId = null;
    draw();
  }

  async function remove(id) {
    if (!confirm('Delete this record?')) return;
    const { error } = await supabase.from(resource.table).delete().eq('id', id); // DELETE
    if (error) {
      // 23503 = foreign key violation: a department still uses this row.
      alert(error.code === '23503' ? 'Cannot delete: it is still used by a department.' : error.message);
      return;
    }
    draw();
  }

  async function draw() {
    const { data: rows, error } = await supabase.from(resource.table).select('*').order('id'); // READ
    if (error) return renderError(container, error);

    const editing = rows.find((row) => row.id === editingId) || {};
    container.innerHTML = formHtml(editing) + tableHtml(rows);

    container.querySelector('#lookup-form').addEventListener('submit', (event) => {
      event.preventDefault();
      save(event.target);
    });
    container.querySelector('[data-cancel]')?.addEventListener('click', () => {
      editingId = null;
      draw();
    });
    container.querySelectorAll('[data-edit]').forEach((button) =>
      button.addEventListener('click', () => {
        editingId = Number(button.dataset.edit);
        draw();
        window.scrollTo(0, 0);
      })
    );
    container.querySelectorAll('[data-delete]').forEach((button) =>
      button.addEventListener('click', () => remove(Number(button.dataset.delete)))
    );
  }

  await draw();
}
