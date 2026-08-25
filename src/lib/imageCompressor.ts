/**
 * imageCompressor.ts
 *
 * Comprime imagens no browser usando Canvas API antes do upload.
 * Reduz arquivos de 3–8 MB para ~300–600 KB sem dependências externas.
 */

export interface CompressOptions {
  /** Largura máxima em pixels. Padrão: 1920 */
  maxWidth?: number;
  /** Altura máxima em pixels. Padrão: 1080 */
  maxHeight?: number;
  /** Qualidade JPEG 0–1. Padrão: 0.82 */
  quality?: number;
  /** Tipo de saída. Padrão: 'image/jpeg' */
  outputType?: 'image/jpeg' | 'image/webp';
}

/**
 * Comprime um arquivo de imagem usando Canvas API.
 * Retorna um novo File já redimensionado e com menor tamanho.
 * Se o arquivo não for imagem, retorna o original sem modificação.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.82,
    outputType = 'image/jpeg',
  } = options;

  // Só processa imagens; devolve o original para outros tipos
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, _reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calcula dimensões mantendo proporção
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Sem suporte a canvas, retorna original
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Só usa o comprimido se for menor que o original
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          const ext = outputType === 'image/webp' ? 'webp' : 'jpg';
          const baseName = file.name.replace(/\.[^.]+$/, '');
          const compressedFile = new File([blob], `${baseName}.${ext}`, {
            type: outputType,
            lastModified: Date.now(),
          });

          console.debug(
            `[imageCompressor] ${file.name}: ${(file.size / 1024).toFixed(0)} KB → ${(compressedFile.size / 1024).toFixed(0)} KB` +
              ` (−${(((file.size - compressedFile.size) / file.size) * 100).toFixed(0)}%)`
          );

          resolve(compressedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Em caso de erro ao carregar, envia o original
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Comprime múltiplas imagens em paralelo.
 */
export async function compressImages(
  files: File[],
  options?: CompressOptions
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, options)));
}
