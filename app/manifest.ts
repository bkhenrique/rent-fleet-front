import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RentFleet',
    short_name: 'RentFleet',
    description: 'Gestão de frota para rent-a-car',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        // TODO: substituir por ícones PNG de verdade (192x192 e 512x512) quando a identidade
        // visual do RentFleet existir — isto é só um placeholder funcional pro manifest ser válido.
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
