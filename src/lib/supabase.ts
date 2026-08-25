import { createClient } from '@supabase/supabase-js';
import { uploadImageToCloudinary, UploadOptions } from './cloudinary';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://ynzlczkqtlytswxobnvc.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_T4cZRqR95AOIIFj7c-eOqg_CHo5xU5B';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const storageBucket = 'delivery-photos';

export async function uploadDeliveryPhoto(
  deliveryId: string,
  file: File,
  _type: string,
  options: UploadOptions = {}
) {
  // Use Cloudinary for delivery photos (project already uses Cloudinary elsewhere)
  const folder = `deliveries/${deliveryId}`;
  try {
    const result = await uploadImageToCloudinary(file, folder, options);
    // Return a storage-style path and a public URL compatible with existing insertion logic
    const path = `${folder}/${result.public_id}`;
    return { path, publicUrl: result.secure_url };
  } catch (error) {
    throw error;
  }
}
