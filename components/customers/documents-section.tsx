'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useApiClient } from '@/lib/use-api-client';
import { CameraInput } from '@/components/ui/camera-input';
import { validateUploadFile, isVideoUrl, type UploadUrlResult } from '@/lib/types/storage';

interface DocumentsSectionProps {
  customerId: string;
  fotosDocumentoUrls: string[];
  onDocumentAdded: () => void;
}

export function DocumentsSection({ customerId, fotosDocumentoUrls, onDocumentAdded }: DocumentsSectionProps) {
  const t = useTranslations('customers');
  const apiClient = useApiClient();

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    const validationError = await validateUploadFile(file);
    if (validationError) {
      setError(t(`documents.${validationError}`));
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const { uploadUrl, key } = await apiClient<UploadUrlResult>(`/customers/${customerId}/documents/upload-url`, {
        method: 'POST',
        body: JSON.stringify({ contentType: file.type }),
      });

      const putResponse = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!putResponse.ok) throw new Error('upload failed');

      // Prefixo privado — anexa pela `key`, não pela `fileUrl` (que só serve pra prefixos públicos).
      await apiClient(`/customers/${customerId}/documents`, { method: 'POST', body: JSON.stringify({ key }) });
      onDocumentAdded();
    } catch {
      setError(t('documents.uploadError'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded border border-border p-4">
      <h2 className="mb-3 text-sm font-semibold">{t('documents.title')}</h2>

      {fotosDocumentoUrls.length === 0 && <p className="mb-3 text-sm text-foreground-dim">{t('documents.empty')}</p>}

      {fotosDocumentoUrls.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {fotosDocumentoUrls.map((url) =>
            isVideoUrl(url) ? (
              <video key={url} src={url} controls muted className="aspect-square rounded object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- URL assinada externa do MinIO
              <img key={url} src={url} alt="" className="aspect-square rounded object-cover" />
            ),
          )}
        </div>
      )}

      <CameraInput label={t('documents.addDocument')} onFileSelected={handleFileSelected} disabled={uploading} />
      {uploading && <p className="mt-2 text-sm text-foreground-dim">{t('documents.uploading')}</p>}
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
