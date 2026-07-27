export interface MapPin {
  x: string;
  y: string;
  tone: 'success' | 'info' | 'accent';
  label?: string;
}

const TONE_VAR: Record<MapPin['tone'], string> = {
  success: 'var(--success)',
  info: 'var(--info)',
  accent: 'var(--accent)',
};

function Pin({ x, y, tone, label }: MapPin) {
  const color = TONE_VAR[tone];
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      <span
        className="anim-ping"
        style={{
          position: 'absolute',
          left: '-9px',
          top: '-9px',
          width: '18px',
          height: '18px',
          borderRadius: '999px',
          background: color,
          opacity: 0.45,
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: '-5px',
          top: '-5px',
          width: '10px',
          height: '10px',
          borderRadius: '999px',
          background: color,
          boxShadow: '0 0 0 2px var(--bg), 0 2px 8px rgba(0,0,0,.6)',
        }}
      />
      {label && (
        <span
          className="mono"
          style={{
            position: 'absolute',
            left: '13px',
            top: '-9px',
            padding: '2px 7px',
            fontSize: '10px',
            letterSpacing: '.02em',
            whiteSpace: 'nowrap',
            color: 'var(--text-dim)',
            background: 'rgba(18,21,26,.92)',
            border: '1px solid var(--border)',
            borderRadius: '5px',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/** Painel de mapa decorativo (grid + ruas + pinos pulsando) — reaproveitado no mockup do hero e na seção "mapa ao vivo". */
export function FleetMapPanel({
  pins,
  size = 'compact',
  caption,
}: {
  pins: MapPin[];
  size?: 'compact' | 'large';
  caption?: string;
}) {
  const large = size === 'large';
  return (
    <div
      className={large ? 'surface anim-float' : undefined}
      style={{
        position: 'relative',
        background: large ? undefined : 'var(--bg-2)',
        border: large ? undefined : '1px solid var(--hairline)',
        borderRadius: large ? undefined : 'var(--radius)',
        overflow: 'hidden',
        minHeight: large ? 440 : 300,
        boxShadow: large ? 'var(--shadow-lg)' : undefined,
      }}
    >
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, backgroundSize: large ? '44px 44px' : '34px 34px', opacity: large ? 1 : 0.8 }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: large
            ? 'radial-gradient(circle at 60% 40%, var(--accent-soft), transparent 62%)'
            : 'linear-gradient(140deg, transparent 30%, var(--accent-soft))',
        }}
      />
      {large ? (
        <>
          <div style={{ position: 'absolute', left: '-12%', right: '-12%', top: '28%', height: 3, background: 'var(--surface-3)', transform: 'rotate(-7deg)' }} />
          <div
            className="anim-lane"
            style={{
              position: 'absolute',
              left: '-12%',
              right: '-12%',
              top: '62%',
              height: 3,
              background: 'repeating-linear-gradient(90deg, var(--surface-3) 0 26px, transparent 26px 52px)',
              transform: 'rotate(5deg)',
            }}
          />
          <div style={{ position: 'absolute', top: '-12%', bottom: '-12%', left: '38%', width: 3, background: 'var(--surface-3)', transform: 'rotate(3deg)' }} />
          <div style={{ position: 'absolute', top: '-12%', bottom: '-12%', left: '74%', width: 2, background: 'var(--hairline)', transform: 'rotate(-4deg)' }} />
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', left: '-10%', right: '-10%', top: '34%', height: 2, background: 'var(--surface-3)', transform: 'rotate(-9deg)' }} />
          <div style={{ position: 'absolute', left: '-10%', right: '-10%', top: '68%', height: 2, background: 'var(--surface-3)', transform: 'rotate(6deg)' }} />
          <div style={{ position: 'absolute', top: '-10%', bottom: '-10%', left: '46%', width: 2, background: 'var(--surface-3)', transform: 'rotate(4deg)' }} />
        </>
      )}

      {pins.map((pin) => (
        <Pin key={`${pin.x}-${pin.y}`} {...pin} />
      ))}

      {caption && !large && (
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
            padding: '10px 12px',
            background: 'rgba(18,21,26,.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span className="dot info" />
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{caption}</span>
        </div>
      )}
    </div>
  );
}
