import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RentFleet',
    short_name: 'RentFleet',
    description: 'Gestão de frota para rent-a-car',
    start_url: '/',
    display: 'standalone',
    background_color: '#08090b',
    theme_color: '#ffb020',
    icons: [
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-icon/512?maskable=1', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
