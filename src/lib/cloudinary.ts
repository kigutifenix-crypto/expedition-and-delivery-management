const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dglgtgahp';
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '338884337775122';
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || 'd2IpM2sUVUBoHDihCtrzdhW2aCs';
const CLOUDINARY_IMAGE_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_VIDEO_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;

const arrayBufferToHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

async function signCloudinaryParams(params: Record<string, string>) {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const stringToSign = `${sortedParams}${CLOUDINARY_API_SECRET}`;
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(stringToSign));

  return arrayBufferToHex(signatureBuffer);
}

export type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  url: string;
  original_filename: string;
  format: string;
};

export async function uploadImageToCloudinary(file: File, folder = 'expeditions') {
  return uploadToCloudinary(file, folder, CLOUDINARY_IMAGE_UPLOAD_URL);
}

export async function uploadVideoToCloudinary(file: File, folder = 'expeditions') {
  return uploadToCloudinary(file, folder, CLOUDINARY_VIDEO_UPLOAD_URL);
}

async function uploadToCloudinary(file: File, folder: string, uploadUrl: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = { folder, timestamp };
  const signature = await signCloudinaryParams(params);
  const formData = new FormData();

  formData.append('file', file);
  formData.append('api_key', CLOUDINARY_API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('signature', signature);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText} ${errorText}`);
  }

  const data = (await response.json()) as CloudinaryUploadResult;
  return data;
}
