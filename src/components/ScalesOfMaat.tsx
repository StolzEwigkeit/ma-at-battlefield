type Props = {
  className?: string;
  /** угол наклона коромысла в градусах; если не задан — коромысло живёт своей анимацией */
  tilt?: number;
};

/** Весы Маат — signature-объект сцены, перенесён из hero-исходника. */
const ScalesOfMaat = ({ className = '', tilt }: Props) => {
  const controlled = typeof tilt === 'number';
  const pan = controlled ? Math.max(-26, Math.min(26, tilt * 2.6)) : 0;

  return (
    <svg viewBox="0 0 520 520" role="img" aria-label="Весы Маат" className={className} overflow="visible">
      <defs>
        <radialGradient id="maat-halo" cx="50%" cy="50%">
          <stop offset="0%" stopColor="hsl(var(--glow))" stopOpacity=".3" />
          <stop offset="70%" stopColor="hsl(var(--glow))" stopOpacity="0" />
        </radialGradient>
        <filter id="maat-soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="260" cy="260" r="230" fill="url(#maat-halo)" />
      <g className="animate-spin-slow origin-[260px_260px]" opacity=".55">
        <circle
          cx="260"
          cy="260"
          r="212"
          fill="none"
          stroke="hsl(var(--lapis))"
          strokeOpacity=".38"
          strokeWidth="1"
          strokeDasharray="2 16"
        />
        <circle cx="260" cy="260" r="186" fill="none" stroke="hsl(var(--lapis))" strokeOpacity=".18" strokeWidth="1" />
      </g>

      {/* колонна */}
      <path d="M260 152 V400" stroke="hsl(var(--beam))" strokeOpacity=".45" strokeWidth="2" />
      <path
        d="M212 402 H308 L288 420 H232 Z"
        fill="hsl(var(--beam))"
        fillOpacity=".16"
        stroke="hsl(var(--beam))"
        strokeOpacity=".45"
        strokeWidth="1.5"
      />
      <circle
        cx="260"
        cy="152"
        r="9"
        fill="hsl(var(--background))"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        filter="url(#maat-soft)"
      />

      {/* коромысло */}
      <g
        className={controlled ? 'origin-[260px_152px] transition-transform duration-700 ease-out' : 'animate-tilt origin-[260px_152px]'}
        style={controlled ? { transform: `rotate(${tilt}deg)` } : undefined}
      >
        <path d="M112 152 H408" stroke="hsl(var(--beam))" strokeOpacity=".8" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="112" cy="152" r="4" fill="hsl(var(--beam))" fillOpacity=".8" />
        <circle cx="408" cy="152" r="4" fill="hsl(var(--beam))" fillOpacity=".8" />
      </g>

      {/* левая чаша: перо истины */}
      <g
        className={controlled ? 'transition-transform duration-700 ease-out' : 'animate-pan-l'}
        style={controlled ? { transform: `translateY(${pan}px)` } : undefined}
      >
        <path d="M112 156 L84 246 M112 156 L140 246" stroke="hsl(var(--beam))" strokeOpacity=".35" strokeWidth="1" />
        <path
          d="M74 248 A38 30 0 0 0 150 248 Z"
          fill="hsl(var(--lapis))"
          fillOpacity=".12"
          stroke="hsl(var(--lapis))"
          strokeOpacity=".8"
          strokeWidth="1.6"
        />
        <path
          d="M112 186 C 96 214, 100 236, 112 246 C 124 236, 128 214, 112 186 Z"
          fill="none"
          stroke="hsl(var(--beam))"
          strokeOpacity=".75"
          strokeWidth="1.4"
        />
        <path d="M112 192 V244" stroke="hsl(var(--beam))" strokeOpacity=".45" strokeWidth="1" />
      </g>

      {/* правая чаша: жертва */}
      <g
        className={controlled ? 'transition-transform duration-700 ease-out' : 'animate-pan-r'}
        style={controlled ? { transform: `translateY(${-pan}px)` } : undefined}
      >
        <path d="M408 156 L380 246 M408 156 L436 246" stroke="hsl(var(--beam))" strokeOpacity=".35" strokeWidth="1" />
        <path
          d="M370 248 A38 30 0 0 0 446 248 Z"
          fill="hsl(var(--primary))"
          fillOpacity=".14"
          stroke="hsl(var(--primary))"
          strokeOpacity=".9"
          strokeWidth="1.6"
        />
        <circle cx="408" cy="222" r="17" fill="hsl(var(--primary))" fillOpacity=".9" filter="url(#maat-soft)" />
        <circle cx="408" cy="222" r="27" fill="none" stroke="hsl(var(--primary))" strokeOpacity=".35" strokeWidth="1" />
      </g>
    </svg>
  );
};

export default ScalesOfMaat;
