'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** Aplica fade-in-up quando o elemento entra na viewport (ver `.reveal`/`.reveal-visible` em globals.css). */
export function Reveal({
  children,
  delay = 0,
  className = '',
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ ...style, animationDelay: visible ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}
