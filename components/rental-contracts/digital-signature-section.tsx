'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useApiClient } from '@/lib/use-api-client';
import { SignaturePad } from '@/components/ui/signature-pad';
import type { AssinaturaDigital, GerarLinkAssinaturaResult, RentalContract } from '@/lib/types/rental-contract';
import type { UploadUrlResult } from '@/lib/types/storage';

interface DigitalSignatureSectionProps {
  contractId: string;
  assinaturaDigital: AssinaturaDigital;
  /** Fotos do contrato assinado à mão (upload manual) — mostradas aqui quando `status` é
   * `assinado_manual`, pra não precisar procurar na seção separada de "Foto do contrato assinado". */
  contratoAssinadoFotoUrls: string[];
  onUpdated: () => void;
}

/** Guarda só o link gerado nesta sessão do navegador — nunca persiste (o token não volta em nenhum GET). */
interface SessionLink {
  token: string;
  expiraEm: string;
}

export function DigitalSignatureSection({
  contractId,
  assinaturaDigital,
  contratoAssinadoFotoUrls,
  onUpdated,
}: DigitalSignatureSectionProps) {
  const t = useTranslations('rentalContracts.detail.assinaturaDigital');
  const locale = useLocale();
  const apiClient = useApiClient();

  const [sessionLink, setSessionLink] = useState<SessionLink | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [signingLocadora, setSigningLocadora] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  async function handleGenerateLink() {
    setGenerating(true);
    setGenerateError(null);
    setCopied(false);
    try {
      const result = await apiClient<GerarLinkAssinaturaResult>(`/rental-contracts/${contractId}/gerar-link-assinatura`, {
        method: 'POST',
      });
      setSessionLink(result);
      onUpdated();
    } catch {
      setGenerateError(t('generateError'));
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    if (!sessionLink) return;
    const url = `${window.location.origin}/${locale}/contrato/assinar/${sessionLink.token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
    });
  }

  async function handleSignLocadora(file: File) {
    setSigningLocadora(true);
    setSignError(null);
    try {
      const { uploadUrl, key } = await apiClient<UploadUrlResult>(
        `/rental-contracts/${contractId}/assinatura-locadora-upload-url`,
        { method: 'POST', body: JSON.stringify({ contentType: 'image/png' }) },
      );
      const putResponse = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: file });
      if (!putResponse.ok) throw new Error('upload failed');

      await apiClient<RentalContract>(`/rental-contracts/${contractId}/assinar-locadora`, {
        method: 'POST',
        body: JSON.stringify({ assinaturaKey: key }),
      });
      onUpdated();
    } catch {
      setSignError(t('signError'));
    } finally {
      setSigningLocadora(false);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }

  function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString(locale);
  }

  const { status, linkAtivo, linkExpiraEm, cliente, locadora } = assinaturaDigital;
  const signatureUrl = sessionLink ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/contrato/assinar/${sessionLink.token}` : '';

  return (
    <div className="rounded border border-black/10 p-4 dark:border-white/15">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{t('sectionTitle')}</h2>
        <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-medium">
          {t(`statusLabel.${status}`)}
        </span>
      </div>

      {(status === 'nao_iniciado' || status === 'aguardando_cliente') && (
        <div className="flex flex-col gap-3">
          {sessionLink ? (
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">{t('linkLabel')}</span>
                <div className="flex flex-wrap gap-2">
                  <input
                    readOnly
                    value={signatureUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 rounded border border-black/15 px-2 py-1.5 text-sm dark:border-white/25"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded border border-black/15 px-3 py-1.5 text-sm font-medium dark:border-white/25"
                  >
                    {copied ? t('copied') : t('copy')}
                  </button>
                </div>
              </label>
              <p className="text-sm text-foreground/60">{t('expiresAt', { time: formatTime(sessionLink.expiraEm) })}</p>
            </div>
          ) : status === 'aguardando_cliente' && linkAtivo && linkExpiraEm ? (
            <p className="text-sm text-foreground/70">
              {t('linkActiveNoToken', { time: formatTime(linkExpiraEm) })}
            </p>
          ) : (
            <p className="text-sm text-foreground/60">{t('notStartedHint')}</p>
          )}

          <button
            type="button"
            onClick={handleGenerateLink}
            disabled={generating}
            className="self-start rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
          >
            {generating ? t('generating') : sessionLink || linkAtivo ? t('regenerateLink') : t('generateLink')}
          </button>

          {status === 'aguardando_cliente' && (
            <p className="text-sm font-medium text-foreground/70">{t('waitingClient')}</p>
          )}

          {generateError && <p className="text-sm text-red-600 dark:text-red-400">{generateError}</p>}
        </div>
      )}

      {(status === 'aguardando_locadora' || status === 'assinado') && cliente && (
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="mb-1 text-xs font-semibold text-foreground/70">{t('clienteEvidenceTitle')}</h3>
            <p className="mb-2 text-sm text-foreground/60">{t('signedAt', { date: formatDateTime(cliente.assinadoEm) })}</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada externa do MinIO */}
                <img src={cliente.documentoFotoUrl} alt={t('documentoFoto')} className="aspect-square rounded object-cover" />
                <span className="text-center text-xs text-foreground/60">{t('documentoFoto')}</span>
              </div>
              <div className="flex flex-col gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada externa do MinIO */}
                <img src={cliente.selfieFotoUrl} alt={t('selfieFoto')} className="aspect-square rounded object-cover" />
                <span className="text-center text-xs text-foreground/60">{t('selfieFoto')}</span>
              </div>
              <div className="flex flex-col gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada externa do MinIO */}
                <img
                  src={cliente.assinaturaImagemUrl}
                  alt={t('assinaturaCliente')}
                  className="aspect-square rounded bg-white object-contain"
                />
                <span className="text-center text-xs text-foreground/60">{t('assinaturaCliente')}</span>
              </div>
            </div>
          </div>

          {status === 'aguardando_locadora' && (
            <div>
              <h3 className="mb-2 text-xs font-semibold text-foreground/70">{t('locadoraSignTitle')}</h3>
              <SignaturePad onConfirm={handleSignLocadora} confirmLabel={t('locadoraSignButton')} confirming={signingLocadora} />
              {signError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{signError}</p>}
            </div>
          )}

          {status === 'assinado' && locadora && (
            <div>
              <h3 className="mb-1 text-xs font-semibold text-foreground/70">{t('locadoraEvidenceTitle')}</h3>
              <p className="mb-2 text-sm text-foreground/60">{t('signedAt', { date: formatDateTime(locadora.assinadoEm) })}</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada externa do MinIO */}
              <img
                src={locadora.assinaturaImagemUrl}
                alt={t('locadoraEvidenceTitle')}
                className="h-28 w-52 rounded bg-white object-contain"
              />
            </div>
          )}
        </div>
      )}

      {status === 'assinado_manual' && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-foreground/70">{t('manualHint')}</p>
          {contratoAssinadoFotoUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {contratoAssinadoFotoUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element -- URL assinada externa do MinIO
                <img key={url} src={url} alt={t('manualFoto')} className="aspect-square rounded object-cover" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
