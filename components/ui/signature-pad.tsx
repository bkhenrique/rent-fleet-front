'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface SignaturePadProps {
  /** Chamado com o PNG desenhado, já pronto pra subir pelo mesmo fluxo de upload de sempre. */
  onConfirm: (file: File) => void;
  confirmLabel: string;
  confirming?: boolean;
}

/**
 * Canvas de assinatura manuscrita — mouse e touch via Pointer Events, sem lib nova (ver bloco 31
 * do MELHORIAS3.md). Reaproveitado tanto na tela pública de assinatura do cliente quanto no painel
 * autenticado (assinatura da locadora).
 */
export function SignaturePad({ onConfirm, confirmLabel, confirming = false }: SignaturePadProps) {
  const t = useTranslations('signaturePad');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);

  function getContext() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = getContext();
    if (!ctx) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const { x, y } = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = getPoint(event);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#171717';
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasStroke) setHasStroke(true);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
  }

  function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas || !hasStroke) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'assinatura.png', { type: 'image/png' });
      onConfirm(file);
    }, 'image/png');
  }

  return (
    <div className="flex flex-col gap-2">
      <canvas
        ref={canvasRef}
        width={600}
        height={220}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full touch-none rounded border border-border bg-white"
        style={{ aspectRatio: '600 / 220' }}
      />
      <p className="text-xs text-foreground-dim">{t('hint')}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="rounded border border-border px-3 py-1.5 text-sm font-medium"
        >
          {t('clear')}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!hasStroke || confirming}
          className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
        >
          {confirming ? t('confirming') : confirmLabel}
        </button>
      </div>
    </div>
  );
}
