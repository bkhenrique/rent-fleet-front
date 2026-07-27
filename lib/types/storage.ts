export type UploadContentType = 'image/jpeg' | 'image/png' | 'image/webp' | 'video/mp4' | 'video/webm';

export const SUPPORTED_UPLOAD_CONTENT_TYPES: UploadContentType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
];

export const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = 80 * 1024 * 1024;
/** Vídeo pensado como "tour" rápido do veículo (giro nos 4 lados + porta-malas + painel), não um
 * documentário — 45s dá espaço de sobra pra isso e mantém upload/storage previsíveis. */
export const MAX_VIDEO_DURATION_SECONDS = 45;

export type UploadValidationError = 'unsupportedType' | 'fileTooLarge' | 'videoTooLong';

function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/** Lê a duração do vídeo sem fazer upload nenhum — carrega só o metadata via um `<video>` off-DOM. */
function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('cannot read video metadata'));
    };
    video.src = objectUrl;
  });
}

/**
 * Valida tipo, tamanho e (pra vídeo) duração antes do upload — roda 100% no cliente, então barra o
 * arquivo problemático antes de gastar banda/tempo com o PUT pro MinIO. Se a duração não puder ser
 * lida (raro, mas alguns navegadores/formatos falham no metadata), deixa passar pro cap de tamanho
 * decidir sozinho em vez de bloquear um vídeo válido por causa de uma leitura falha.
 */
export async function validateUploadFile(file: File): Promise<UploadValidationError | null> {
  if (!SUPPORTED_UPLOAD_CONTENT_TYPES.includes(file.type as UploadContentType)) return 'unsupportedType';

  const isVideo = isVideoFile(file);
  const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (file.size > maxSize) return 'fileTooLarge';

  if (isVideo) {
    try {
      const duration = await readVideoDuration(file);
      if (duration > MAX_VIDEO_DURATION_SECONDS) return 'videoTooLong';
    } catch {
      // metadata ilegível — segue só com a checagem de tamanho já feita acima.
    }
  }

  return null;
}

/** `true` quando a URL/key aponta pra um vídeo — as 3 telas de upload só recebem a URL final, não o
 * content-type original, então a extensão é o único sinal disponível pra decidir `<img>` vs `<video>`. */
export function isVideoUrl(url: string): boolean {
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.mp4') || clean.endsWith('.webm');
}

export interface UploadUrlResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}
