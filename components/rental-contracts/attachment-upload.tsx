'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useApiClient } from '@/lib/use-api-client';
import { CameraInput } from '@/components/ui/camera-input';
import { validateUploadFile, isVideoUrl, type UploadUrlResult } from '@/lib/types/storage';
import type { AttachmentPurpose } from '@/lib/types/rental-contract';

interface AttachmentUploadProps {
  contractId: string;
  purpose: AttachmentPurpose;
  fotosUrls: string[];
  onUploaded: () => void;
}

export function AttachmentUpload({ contractId, purpose, fotosUrls, onUploaded }: AttachmentUploadProps) {
  const t = useTranslations('rentalContracts');
  const apiClient = useApiClient();

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    const validationError = await validateUploadFile(file);
    if (validationError) {
      setError(t(`attachments.${validationError}`));
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const { uploadUrl, key } = await apiClient<UploadUrlResult>(`/rental-contracts/${contractId}/upload-url`, {
        method: 'POST',
        body: JSON.stringify({ contentType: file.type, purpose }),
      });

      const putResponse = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!putResponse.ok) throw new Error('upload failed');

      await apiClient(`/rental-contracts/${contractId}/attachments`, {
        method: 'POST',
        body: JSON.stringify({ key, purpose }),
      });
      onUploaded();
    } catch {
      setError(t('attachments.uploadError'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {fotosUrls.length === 0 && <p className="mb-2 text-sm text-foreground-dim">{t('attachments.empty')}</p>}
      {fotosUrls.length > 0 && (
        <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {fotosUrls.map((url) =>
            isVideoUrl(url) ? (
              <video key={url} src={url} controls muted className="aspect-square rounded object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- URL assinada externa do MinIO
              <img key={url} src={url} alt="" className="aspect-square rounded object-cover" />
            ),
          )}
        </div>
      )}
      <CameraInput label={t('attachments.addPhoto')} onFileSelected={handleFileSelected} disabled={uploading} />
      {uploading && <p className="mt-1 text-sm text-foreground-dim">{t('attachments.uploading')}</p>}
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
