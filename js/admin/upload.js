// Image upload to Supabase Storage. Only admins may upload (see storage policies).
import { supabase } from '../supabaseClient.js';
import { CONFIG } from '../config.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Uploads one image and returns its public URL.
 * Returns null when no file was chosen. Throws an Error on invalid files.
 */
export async function uploadImage(file) {
  if (!file || !file.size) return null;
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Images must be JPG, PNG or WebP.');
  if (file.size > MAX_BYTES) throw new Error('Images must be 2 MB or smaller.');

  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
  const path = `${crypto.randomUUID()}.${extension}`;

  const bucket = supabase.storage.from(CONFIG.STORAGE_BUCKET);
  const { error } = await bucket.upload(path, file);
  if (error) throw error;

  return bucket.getPublicUrl(path).data.publicUrl;
}
