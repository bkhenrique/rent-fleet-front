'use client';

import { useRef } from 'react';

interface CameraInputProps {
  /** Texto visível no botão (ex: "Tirar foto" / "Adicionar foto"). */
  label: string;
  onFileSelected: (file: File) => void;
  /** Default cobre foto e vídeo — no mobile isso costuma abrir um seletor com as duas opções na
   * própria câmera nativa; em desktop (sem câmera) cai no seletor de arquivo normal. */
  accept?: string;
  disabled?: boolean;
}

/**
 * Botão de câmera reaproveitável (foto ou vídeo) usado nos 3 uploads do app (fotos de veículo,
 * documento de cliente, anexos de contrato) — ver bloco 29 do MELHORIAS3.md. O `<input
 * type="file" capture="environment">` cru fica visualmente escondido mas continua acessível via
 * teclado/leitor de tela (`sr-only`, não `hidden`); o clique no `<button>` visível dispara o input.
 */
export function CameraInput({ label, onFileSelected, accept = 'image/*,video/*', disabled = false }: CameraInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onFileSelected(file);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture="environment"
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="flex items-center gap-2 rounded border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 8a2 2 0 0 1 2-2h1.2l.9-1.5A1.5 1.5 0 0 1 9.4 3.7h5.2a1.5 1.5 0 0 1 1.3.8L17 6.5V6h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
          <circle cx="12" cy="13" r="3.4" />
        </svg>
        {label}
      </button>
    </div>
  );
}
