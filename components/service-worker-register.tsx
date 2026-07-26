'use client';

import { useEffect } from 'react';

/**
 * Registro nativo do service worker — não usamos `next-pwa` porque ele é baseado em plugin de
 * Webpack e o Next.js 16 usa Turbopack por padrão (ver TAREFAS.md bloco 9 e
 * node_modules/next/dist/docs/.../upgrading/version-16.md).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // instalação do PWA é um extra, não algo que deva quebrar a navegação se falhar
      });
    }
  }, []);

  return null;
}
