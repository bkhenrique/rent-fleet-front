'use client';

import { useEffect } from 'react';

/**
 * Registro nativo do service worker — não usamos `next-pwa` porque ele é baseado em plugin de
 * Webpack e o Next.js 16 usa Turbopack por padrão (ver TAREFAS.md bloco 9 e
 * node_modules/next/dist/docs/.../upgrading/version-16.md).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // instalação do PWA é um extra, não algo que deva quebrar a navegação se falhar
      });
      return;
    }

    // Em dev, desfaz sozinho qualquer service worker/cache que tenha sobrado de uma sessão anterior
    // (ex: um `next start` de teste, ou o registro incondicional que existia antes desse guard) —
    // sem isso, o cache-first do sw.js pra script/style (ver public/sw.js) trava o navegador num
    // JS/CSS congelado e exige limpeza manual no DevTools a cada mudança de código.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => void registration.unregister());
    });
    if ('caches' in window) {
      caches.keys().then((keys) => keys.forEach((key) => void caches.delete(key)));
    }
  }, []);

  return null;
}
