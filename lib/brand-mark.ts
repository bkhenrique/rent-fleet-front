/**
 * Path data da marca RentFleet — fonte única, consumida por `components/landing-icons.tsx`
 * (header/footer da landing), `app/icon.tsx` (favicon), `app/apple-icon.tsx`,
 * `app/pwa-icon/[size]/route.tsx` e `app/[locale]/opengraph-image.tsx`. Antes cada arquivo tinha
 * essa mesma string de paths copiada — centralizado aqui pra mudar a marca num lugar só.
 *
 * Conceito: carro (a frota) + pino de localização (o diferencial é saber onde cada carro está) +
 * seta de crescimento (baseado no logo gerado em imagens/Gemini_Generated_Image_9yk29i9yk29i9yk2,
 * adaptado pras nossas cores âmbar/asfalto em vez do teal original).
 */
export interface BrandMarkPath {
  key: string;
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeLinecap?: 'round' | 'butt' | 'square';
  strokeLinejoin?: 'round' | 'miter' | 'bevel';
  fillRule?: 'evenodd' | 'nonzero';
}

/** Cor única usada por todos os paths — troque aqui pra recolorir a marca inteira de uma vez. */
export const BRAND_MARK_COLOR = '#10120f';

export const BRAND_MARK_PATHS: BrandMarkPath[] = [
  {
    key: 'car-body',
    d: 'M3.5 16.2v-3l1.3-3.3a1.8 1.8 0 0 1 1.7-1.1h6.3c.7 0 1.4.4 1.7 1.1l1.3 3.3v3',
    stroke: BRAND_MARK_COLOR,
    strokeWidth: '2.1',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  },
  {
    key: 'car-wheel-arch',
    d: 'M3.5 16.2h11.8v1.3a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-.6H6v.6a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9z',
    stroke: BRAND_MARK_COLOR,
    strokeWidth: '2.1',
    strokeLinejoin: 'round',
    fill: 'none',
  },
  { key: 'wheel-left', d: 'M6.4 13.4m-0.9 0a0.9 0.9 0 1 0 1.8 0a0.9 0.9 0 1 0 -1.8 0', fill: BRAND_MARK_COLOR },
  { key: 'wheel-right', d: 'M12.6 13.4m-0.9 0a0.9 0.9 0 1 0 1.8 0a0.9 0.9 0 1 0 -1.8 0', fill: BRAND_MARK_COLOR },
  {
    key: 'pin',
    d: 'M18.2 2.6a2.9 2.9 0 0 0-2.9 2.9c0 2.2 2.9 5 2.9 5s2.9-2.8 2.9-5a2.9 2.9 0 0 0-2.9-2.9zm0 4.3a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8z',
    fill: BRAND_MARK_COLOR,
    fillRule: 'evenodd',
  },
  // seta de crescimento — o elemento novo, inspirado no logo gerado (car + pin + arrow)
  {
    key: 'arrow-shaft',
    d: 'M10.8 8.6L15.6 3.8',
    stroke: BRAND_MARK_COLOR,
    strokeWidth: '1.7',
    strokeLinecap: 'round',
  },
  {
    key: 'arrow-head',
    d: 'M12 3.6h3.7v3.7',
    stroke: BRAND_MARK_COLOR,
    strokeWidth: '1.7',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  },
];
