/**
 * cloudinary.ts
 *
 * Funções de upload para o Cloudinary com:
 *  - Compressão automática de imagens via Canvas API (sem dependências)
 *  - Progresso de upload em tempo real via XMLHttpRequest
 *  - Limite de tamanho de arquivo para vídeos
 */

import { compressImage } from './imageCompressor';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dglgtgahp';
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '338884337775122';
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || 'd2IpM2sUVUBoHDihCtrzdhW2aCs';
const CLOUDINARY_IMAGE_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_VIDEO_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;

/** Tamanho máximo de vídeo permitido (200 MB) */
const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024;

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

export interface UploadOptions {
  /** Callback chamado com progresso de 0 a 100 durante o upload */
  onProgress?: (percent: number) => void;
}

/**
 * Envia uma imagem ao Cloudinary.
 * A imagem é automaticamente comprimida no browser antes do envio.
 */
export async function uploadImageToCloudinary(
  file: File,
  folder = 'expeditions',
  options: UploadOptions = {}
) {
  // Comprime a imagem antes de enviar (4 MB → ~400 KB típico)
  const compressed = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.82,
  });
  return uploadToCloudinary(compressed, folder, CLOUDINARY_IMAGE_UPLOAD_URL, {}, options);
}

/**
 * Envia um vídeo ao Cloudinary.
 * Valida o tamanho antes do upload e exibe progresso em tempo real.
 */
export async function uploadVideoToCloudinary(
  file: File,
  folder = 'expeditions',
  options: UploadOptions = {}
) {
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error(
      `O vídeo é muito grande (${(file.size / 1024 / 1024).toFixed(0)} MB). O limite é 200 MB.`
    );
  }
  return uploadToCloudinary(file, folder, CLOUDINARY_VIDEO_UPLOAD_URL, {}, options);
}

/**
 * Função interna de upload usando XMLHttpRequest para suporte a progresso.
 */
async function uploadToCloudinary(
  file: File,
  folder: string,
  uploadUrl: string,
  extraParams: Record<string, string> = {},
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params: Record<string, string> = { folder, timestamp, ...extraParams };
  const signature = await signCloudinaryParams(params);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', CLOUDINARY_API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('signature', signature);
  for (const [key, value] of Object.entries(extraParams)) {
    formData.append(key, value);
  }

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progresso de upload em tempo real
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && options.onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        options.onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as CloudinaryUploadResult;
          resolve(data);
        } catch {
          reject(new Error('Resposta inválida do Cloudinary.'));
        }
      } else {
        reject(
          new Error(`Cloudinary upload failed: ${xhr.status} ${xhr.statusText} — ${xhr.responseText}`)
        );
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Falha de rede ao enviar arquivo.')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelado.')));

    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
}
