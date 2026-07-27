'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useApiClient } from '@/lib/use-api-client';

const SUPPORTED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UploadUrlResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

interface PhotosSectionProps {
  vehicleId: string;
  fotos: string[];
  onPhotoAdded: (url: string) => void;
}

export function PhotosSection({ vehicleId, fotos, onPhotoAdded }: PhotosSectionProps) {
  const t = useTranslations('vehicles');
  const apiClient = useApiClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!SUPPORTED_CONTENT_TYPES.includes(file.type)) {
      setError(t('photos.unsupportedType'));
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const { uploadUrl, fileUrl } = await apiClient<UploadUrlResult>(`/vehicles/${vehicleId}/photos/upload-url`, {
        method: 'POST',
        body: JSON.stringify({ contentType: file.type }),
      });

      const putResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putResponse.ok) {
        throw new Error('upload failed');
      }

      await apiClient(`/vehicles/${vehicleId}/photos`, {
        method: 'POST',
        body: JSON.stringify({ url: fileUrl }),
      });
      onPhotoAdded(fileUrl);
    } catch {
      setError(t('photos.uploadError'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded border border-black/10 p-4 dark:border-white/15">
      <h2 className="mb-3 text-sm font-semibold">{t('photos.title')}</h2>

      {fotos.length === 0 && <p className="mb-3 text-sm text-foreground/60">{t('photos.empty')}</p>}

      {fotos.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {fotos.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element -- fotos vêm de URLs externas do MinIO, sem otimização do Next
            <img key={url} src={url} alt="" className="aspect-square rounded object-cover" />
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={SUPPORTED_CONTENT_TYPES.join(',')}
        onChange={handleFileChange}
        disabled={uploading}
        className="text-sm"
      />
      {uploading && <p className="mt-2 text-sm text-foreground/60">{t('photos.uploading')}</p>}
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
