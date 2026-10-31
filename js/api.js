// Data access layer: every read query the public pages need lives here.
import { supabase } from './supabaseClient.js';

const DEPARTMENT_FIELDS =
  '*, categories(category_name), buildings(building_name, latitude, longitude)';

/** All departments (with category and building), A-Z or newest first. */
export async function fetchDepartments({ limit, newestFirst = false } = {}) {
  let query = supabase.from('departments').select(DEPARTMENT_FIELDS);
  query = newestFirst
    ? query.order('created_at', { ascending: false })
    : query.order('department_name');
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('id');
  if (error) throw error;
  return data;
}

/** One department by slug, including its gallery images. Returns null if missing. */
export async function fetchDepartmentBySlug(slug) {
  const { data, error } = await supabase
    .from('departments')
    .select(`${DEPARTMENT_FIELDS}, department_images(image_path)`)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}
