'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useApiClient } from '@/lib/use-api-client';
import { CameraInput } from '@/components/ui/camera-input';
import { validateUploadFile, isVideoUrl, type UploadUrlResult } from '@/lib/types/storage';

interface PhotosSectionProps {
  vehicleId: string;
  fotos: string[];
  onPhotoAdded: (url: string) => void;
}

export function PhotosSection({ vehicleId, fotos, onPhotoAdded }: PhotosSectionProps) {
  const t = useTranslations('vehicles');
  const apiClient = useApiClient();

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    const validationError = await validateUploadFile(file);
    if (validationError) {
      setError(t(`photos.${validationError}`));
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
    <div className="rounded border border-border p-4">
      <h2 className="mb-3 text-sm font-semibold">{t('photos.title')}</h2>

      {fotos.length === 0 && <p className="mb-3 text-sm text-foreground-dim">{t('photos.empty')}</p>}

      {fotos.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {fotos.map((url) =>
            isVideoUrl(url) ? (
              <video key={url} src={url} controls muted className="aspect-square rounded object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- fotos vêm de URLs externas do MinIO, sem otimização do Next
              <img key={url} src={url} alt="" className="aspect-square rounded object-cover" />
            ),
          )}
        </div>
      )}

      <CameraInput label={t('photos.addPhoto')} onFileSelected={handleFileSelected} disabled={uploading} />
      {uploading && <p className="mt-2 text-sm text-foreground-dim">{t('photos.uploading')}</p>}
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
