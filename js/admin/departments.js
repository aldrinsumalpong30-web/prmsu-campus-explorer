// Create / Read / Update / Delete for departments (with image uploads).
import { supabase } from '../supabaseClient.js';
import { uploadImage } from './upload.js';
import { escapeHtml, slugify, renderError } from '../utils.js';

function optionsHtml(rows, labelKey, selectedId) {
  return rows
    .map(
      (row) =>
        `<option value="${row.id}" ${row.id === selectedId ? 'selected' : ''}>${escapeHtml(row[labelKey])}</option>`
    )
    .join('');
}

export async function renderDepartments(container) {
  let editingId = null;

  function formHtml(dep, categories, buildings) {
    return `
      <form id="department-form" class="bg-white p-3 rounded mb-3">
        <h5>${dep.id ? 'Edit' : 'Add'} Department</h5>
        <input name="department_name" class="form-control mb-2" placeholder="Name" required
               value="${escapeHtml(dep.department_name)}">
        <select name="category_id" class="form-select mb-2" aria-label="Category">
          ${optionsHtml(categories, 'category_name', dep.category_id)}
        </select>
        <select name="building_id" class="form-select mb-2" aria-label="Building">
          <option value="">- No building -</option>
          ${optionsHtml(buildings, 'building_name', dep.building_id)}
        </select>
        <textarea name="description" class="form-control mb-2" placeholder="Description">${escapeHtml(dep.description)}</textarea>
        <textarea name="programs" class="form-control mb-2" placeholder="Programs / services, one per line">${escapeHtml(dep.programs)}</textarea>
        <input name="contact_email" type="email" class="form-control mb-2" placeholder="Contact email"
               value="${escapeHtml(dep.contact_email)}">
        <input name="contact_number" class="form-control mb-2" placeholder="Contact number"
               value="${escapeHtml(dep.contact_number)}">
        <label class="form-label">Main image ${dep.id ? '(leave empty to keep the current one)' : ''}</label>
        <input type="file" name="image" accept="image/*" class="form-control mb-2">
        <label class="form-label">Gallery images</label>
        <input type="file" name="gallery" multiple accept="image/*" class="form-control mb-3">
        <button type="submit" class="btn btn-gold">Save</button>
        ${dep.id ? '<button type="button" class="btn btn-link" data-cancel>Cancel</button>' : ''}
      </form>`;
  }

  function tableHtml(departments) {
    const rows = departments
      .map(
        (dep) => `
        <tr>
          <td>${escapeHtml(dep.department_name)}</td>
          <td>${escapeHtml(dep.categories?.category_name)}</td>
          <td>${escapeHtml(dep.buildings?.building_name)}</td>
          <td class="text-end text-nowrap">
            <button class="btn btn-sm btn-outline-primary" data-edit="${dep.id}">Edit</button>
            <button class="btn btn-sm btn-outline-danger" data-delete="${dep.id}">Delete</button>
          </td>
        </tr>`
      )
      .join('');
    return `<div class="table-responsive"><table class="table bg-white align-middle">${rows}</table></div>`;
  }

  async function save(form) {
    const data = new FormData(form);
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;

    try {
      const row = {
        department_name: data.get('department_name').trim(),
        category_id: Number(data.get('category_id')),
        building_id: data.get('building_id') ? Number(data.get('building_id')) : null,
        description: data.get('description'),
        programs: data.get('programs'),
        contact_email: data.get('contact_email') || null,
        contact_number: data.get('contact_number'),
        updated_at: new Date().toISOString(),
      };

      const mainImage = await uploadImage(data.get('image'));
      if (mainImage) row.image = mainImage;

      let id = editingId;
      if (id) {
        // UPDATE
        const { error } = await supabase.from('departments').update(row).eq('id', id);
        if (error) throw error;
      } else {
        // CREATE (the slug is the readable, unique part of the department URL)
        row.slug = `${slugify(row.department_name)}-${Math.random().toString(36).slice(2, 6)}`;
        const { data: created, error } = await supabase
          .from('departments')
          .insert(row)
          .select('id')
          .single();
        if (error) throw error;
        id = created.id;
      }

      for (const file of data.getAll('gallery')) {
        const url = await uploadImage(file);
        if (!url) continue;
        const { error } = await supabase
          .from('department_images')
          .insert({ department_id: id, image_path: url });
        if (error) throw error;
      }

      editingId = null;
      await draw();
    } catch (error) {
      alert(error.message);
      button.disabled = false;
    }
  }

  async function remove(id) {
    if (!confirm('Delete this department? Its gallery images are removed too.')) return;
    const { error } = await supabase.from('departments').delete().eq('id', id); // DELETE
    if (error) alert(error.message);
    draw();
  }

  async function draw() {
    // READ everything the form and table need, in parallel.
    const [categories, buildings, departments] = await Promise.all([
      supabase.from('categories').select('*').order('id'),
      supabase.from('buildings').select('*').order('id'),
      supabase
        .from('departments')
        .select('*, categories(category_name), buildings(building_name)')
        .order('created_at', { ascending: false }),
    ]);
    const failed = [categories, buildings, departments].find((result) => result.error);
    if (failed) return renderError(container, failed.error);

    const editing = departments.data.find((dep) => dep.id === editingId) || {};
    container.innerHTML =
      formHtml(editing, categories.data, buildings.data) + tableHtml(departments.data);

    container.querySelector('#department-form').addEventListener('submit', (event) => {
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
