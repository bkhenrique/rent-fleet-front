'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { apiFetch } from '@/lib/api-client';
import { formatCurrency } from '@/lib/currency';
import { CameraInput } from '@/components/ui/camera-input';
import { SignaturePad } from '@/components/ui/signature-pad';
import { MAX_IMAGE_SIZE_BYTES } from '@/lib/types/storage';
import type { UploadUrlResult } from '@/lib/types/storage';
import type { PublicSignatureView, PublicUploadPurpose } from '@/lib/types/rental-contract';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type Step = 'loading' | 'notFound' | 'view';

interface CapturedStep {
  key: string;
  previewUrl: string;
}

function PublicSignPage({ token }: { token: string }) {
  const t = useTranslations('publicContract.sign');
  const locale = useLocale();

  const [step, setStep] = useState<Step>('loading');
  const [view, setView] = useState<PublicSignatureView | null>(null);

  const [documento, setDocumento] = useState<CapturedStep | null>(null);
  const [selfie, setSelfie] = useState<CapturedStep | null>(null);
  const [assinatura, setAssinatura] = useState<CapturedStep | null>(null);

  const [uploadingPurpose, setUploadingPurpose] = useState<PublicUploadPurpose | null>(null);
  const [fieldError, setFieldError] = useState<Record<PublicUploadPurpose, string | null>>({
    documento: null,
    selfie: null,
    assinatura: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    apiFetch<PublicSignatureView>(`/public/contratos/assinar/${token}`)
      .then((result) => {
        setView(result);
        setStep('view');
      })
      .catch(() => setStep('notFound'));
  }, [token]);

  async function validateImageFile(file: File): Promise<string | null> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return t('errors.unsupportedType');
    if (file.size > MAX_IMAGE_SIZE_BYTES) return t('errors.fileTooLarge');
    return null;
  }

  async function uploadImage(purpose: PublicUploadPurpose, file: File): Promise<string> {
    const { uploadUrl, key } = await apiFetch<UploadUrlResult>(`/public/contratos/assinar/${token}/upload-url`, {
      method: 'POST',
      body: JSON.stringify({ contentType: file.type, purpose }),
    });
    const putResponse = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    if (!putResponse.ok) throw new Error('upload failed');
    return key;
  }

  async function handleCapture(purpose: PublicUploadPurpose, file: File) {
    const validationError = await validateImageFile(file);
    if (validationError) {
      setFieldError((prev) => ({ ...prev, [purpose]: validationError }));
      return;
    }
    setFieldError((prev) => ({ ...prev, [purpose]: null }));
    setUploadingPurpose(purpose);
    try {
      const key = await uploadImage(purpose, file);
      const previewUrl = URL.createObjectURL(file);
      const captured = { key, previewUrl };
      if (purpose === 'documento') setDocumento(captured);
      if (purpose === 'selfie') setSelfie(captured);
      if (purpose === 'assinatura') setAssinatura(captured);
    } catch {
      setFieldError((prev) => ({ ...prev, [purpose]: t('errors.uploadError') }));
    } finally {
      setUploadingPurpose(null);
    }
  }

  async function handleSignatureConfirm(file: File) {
    await handleCapture('assinatura', file);
  }

  async function handleSubmit() {
    if (!documento || !selfie || !assinatura) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch(`/public/contratos/assinar/${token}/assinar`, {
        method: 'POST',
        body: JSON.stringify({
          documentoKey: documento.key,
          selfieKey: selfie.key,
          assinaturaKey: assinatura.key,
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitError(t('errors.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'loading') {
    return <p className="px-4 py-10 text-center text-sm text-foreground-dim">{t('loading')}</p>;
  }

  if (step === 'notFound') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-lg font-semibold">{t('notFound.title')}</h1>
        <p className="mt-2 text-sm text-foreground-dim">{t('notFound.message')}</p>
      </div>
    );
  }

  if (!view) return null;

  if (view.status === 'expirado') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-lg font-semibold">{t('expired.title')}</h1>
        <p className="mt-2 text-sm text-foreground-dim">{t('expired.message')}</p>
      </div>
    );
  }

  if (view.status === 'ja_assinado') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-lg font-semibold">{t('alreadySigned.title')}</h1>
        <p className="mt-2 text-sm text-foreground-dim">{t('alreadySigned.message')}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-accent-strong">{t('success.title')}</h1>
        <p className="mt-2 text-sm text-foreground-dim">{t('success.message')}</p>
      </div>
    );
  }

  const { resumo } = view;
  const allCaptured = Boolean(documento && selfie && assinatura);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-lg font-semibold">{t('title')}</h1>
        <p className="mt-1 text-sm text-foreground-dim">{t('subtitle')}</p>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 rounded border border-border p-4 text-sm">
        <dt className="font-medium">{t('summary.cliente')}</dt>
        <dd>{resumo.clienteNome}</dd>
        <dt className="font-medium">{t('summary.veiculo')}</dt>
        <dd>
          {resumo.veiculo.placa} — {resumo.veiculo.marca} {resumo.veiculo.modelo}
        </dd>
        <dt className="font-medium">{t('summary.periodo')}</dt>
        <dd>
          {new Date(resumo.dataInicio).toLocaleDateString(locale)} — {new Date(resumo.dataFim).toLocaleDateString(locale)}
        </dd>
        <dt className="font-medium">{t('summary.valor')}</dt>
        <dd>{formatCurrency(resumo.valor, resumo.moeda)}</dd>
      </dl>

      <p className="rounded border border-border bg-foreground/5 p-3 text-xs text-foreground-dim">
        {t('privacyNotice')}
      </p>

      <section className="flex flex-col gap-2 rounded border border-border p-4">
        <h2 className="text-sm font-semibold">{t('step1.title')}</h2>
        <p className="text-xs text-foreground-dim">{t('step1.hint')}</p>
        {documento && (
          // eslint-disable-next-line @next/next/no-img-element -- preview local via object URL
          <img src={documento.previewUrl} alt="" className="h-32 w-full rounded object-cover" />
        )}
        <CameraInput
          label={documento ? t('step1.retake') : t('step1.capture')}
          accept="image/*"
          onFileSelected={(file) => handleCapture('documento', file)}
          disabled={uploadingPurpose === 'documento'}
        />
        {uploadingPurpose === 'documento' && <p className="text-xs text-foreground-dim">{t('uploading')}</p>}
        {fieldError.documento && <p className="text-xs text-danger">{fieldError.documento}</p>}
      </section>

      <section className="flex flex-col gap-2 rounded border border-border p-4">
        <h2 className="text-sm font-semibold">{t('step2.title')}</h2>
        <p className="text-xs text-foreground-dim">{t('step2.hint')}</p>
        {selfie && (
          // eslint-disable-next-line @next/next/no-img-element -- preview local via object URL
          <img src={selfie.previewUrl} alt="" className="h-32 w-full rounded object-cover" />
        )}
        <CameraInput
          label={selfie ? t('step2.retake') : t('step2.capture')}
          accept="image/*"
          onFileSelected={(file) => handleCapture('selfie', file)}
          disabled={uploadingPurpose === 'selfie'}
        />
        {uploadingPurpose === 'selfie' && <p className="text-xs text-foreground-dim">{t('uploading')}</p>}
        {fieldError.selfie && <p className="text-xs text-danger">{fieldError.selfie}</p>}
      </section>

      <section className="flex flex-col gap-2 rounded border border-border p-4">
        <h2 className="text-sm font-semibold">{t('step3.title')}</h2>
        <p className="text-xs text-foreground-dim">{t('step3.hint')}</p>
        {assinatura ? (
          <div className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- preview local via object URL */}
            <img src={assinatura.previewUrl} alt="" className="h-28 w-full rounded bg-white object-contain" />
            <button
              type="button"
              onClick={() => setAssinatura(null)}
              className="self-start rounded border border-border px-3 py-1.5 text-sm font-medium"
            >
              {t('step3.redo')}
            </button>
          </div>
        ) : (
          <SignaturePad onConfirm={handleSignatureConfirm} confirmLabel={t('step3.confirm')} confirming={uploadingPurpose === 'assinatura'} />
        )}
        {fieldError.assinatura && <p className="text-xs text-danger">{fieldError.assinatura}</p>}
      </section>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allCaptured || submitting}
        className="rounded bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-50"
      >
        {submitting ? t('submitting') : t('submit')}
      </button>
      {submitError && <p className="text-sm text-danger">{submitError}</p>}
    </div>
  );
}

export default function PublicSignPageWrapper({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <PublicSignPage token={token} />;
}
