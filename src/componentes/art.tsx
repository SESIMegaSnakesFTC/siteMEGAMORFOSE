import type { AreaId } from '../scripts/types';

// Ilustrações vetoriais próprias do MegaMorfose (sem imagens externas).

export function AreaArt({ area, className = '' }: { area: AreaId; className?: string }) {
  if (area === 'ia')
    return (
      <svg viewBox="0 0 200 160" className={className} aria-hidden>
        <circle cx="100" cy="80" r="58" fill="white" opacity=".16" />
        <path d="M30 80c20-34 46-50 70-50s50 16 70 50c-20 34-46 50-70 50S50 114 30 80Z" fill="white" opacity=".95" />
        <circle cx="100" cy="80" r="30" fill="#7C4DFF" />
        <circle cx="100" cy="80" r="14" fill="#14142B" />
        <circle cx="108" cy="72" r="5" fill="white" />
        <g stroke="white" strokeWidth="2.5" opacity=".9">
          <path d="M100 18v-10M150 32l8-8M50 32l-8-8" strokeLinecap="round" />
        </g>
        <g fill="#FFD23F">
          <rect x="22" y="128" width="10" height="10" rx="2" />
          <rect x="168" y="20" width="8" height="8" rx="2" />
        </g>
        <path d="M60 140h80" stroke="white" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
      </svg>
    );
  if (area === 'eletronica')
    return (
      <svg viewBox="0 0 200 160" className={className} aria-hidden>
        <rect x="40" y="30" width="120" height="100" rx="14" fill="white" opacity=".95" />
        <g stroke="#FF7A1A" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M60 60h30v40h50" />
          <path d="M60 100h18M110 60h30" />
        </g>
        <circle cx="60" cy="60" r="7" fill="#14142B" />
        <circle cx="60" cy="100" r="7" fill="#14142B" />
        <circle cx="140" cy="60" r="7" fill="#14142B" />
        <circle cx="140" cy="100" r="7" fill="#14142B" />
        <path d="M100 52l-8 12h10l-8 12" stroke="#F5B800" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="170" cy="30" r="10" fill="#FFD23F" />
        <path d="M170 16v-8M184 30h8M180 20l6-6" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <rect x="20" y="120" width="14" height="14" rx="3" fill="white" opacity=".5" />
      </svg>
    );
  if (area === 'mecanica')
    return (
      <svg viewBox="0 0 200 160" className={className} aria-hidden>
        <g className="origin-[80px_86px] animate-spin_slow">
          <Gear cx={80} cy={86} r={40} teeth={10} fill="white" />
          <circle cx="80" cy="86" r="12" fill="#2F6BFF" />
        </g>
        <g className="origin-[142px_52px] animate-spin_slow [animation-direction:reverse]">
          <Gear cx={142} cy={52} r={24} teeth={8} fill="#FFD23F" />
          <circle cx="142" cy="52" r="7" fill="#14142B" />
        </g>
        <path d="M130 130h50" stroke="white" strokeWidth="5" strokeLinecap="round" />
        <path d="M155 130l-12-24" stroke="white" strokeWidth="5" strokeLinecap="round" />
        <circle cx="143" cy="106" r="6" fill="white" />
      </svg>
    );
  return (
    <svg viewBox="0 0 200 160" className={className} aria-hidden>
      <path d="M100 20l12 30 32 4-24 21 7 32-27-16-27 16 7-32-24-21 32-4Z" fill="white" opacity=".95" />
      <circle cx="40" cy="120" r="14" fill="#FFD23F" />
      <rect x="140" y="104" width="30" height="30" rx="8" fill="white" opacity=".5" />
    </svg>
  );
}

function Gear({ cx, cy, r, teeth, fill }: { cx: number; cy: number; r: number; teeth: number; fill: string }) {
  const pts: string[] = [];
  const inner = r * 0.78;
  for (let i = 0; i < teeth * 2; i++) {
    const a1 = (Math.PI * i) / teeth;
    const a2 = (Math.PI * (i + 1)) / teeth;
    const rr = i % 2 === 0 ? r : inner;
    pts.push(`${cx + rr * Math.cos(a1)},${cy + rr * Math.sin(a1)}`, `${cx + rr * Math.cos(a2)},${cy + rr * Math.sin(a2)}`);
  }
  return <polygon points={pts.join(' ')} fill={fill} />;
}

export function HeroArt() {
  return (
    <svg viewBox="0 0 520 460" className="h-auto w-full" role="img" aria-label="Ilustração de um robô amigável cercado por engrenagens, circuitos e um olho de visão computacional">
      <defs>
        <linearGradient id="hb" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#7C4DFF" />
          <stop offset="1" stopColor="#2F6BFF" />
        </linearGradient>
        <linearGradient id="ho" x1="0" x2="1">
          <stop offset="0" stopColor="#FF7A1A" />
          <stop offset="1" stopColor="#FFD23F" />
        </linearGradient>
      </defs>
      <circle cx="260" cy="240" r="190" fill="#EEF3FF" />
      <circle cx="260" cy="240" r="140" fill="#F4EFFF" />
      {/* órbita */}
      <ellipse cx="260" cy="240" rx="230" ry="80" fill="none" stroke="#DCE6FF" strokeWidth="2" strokeDasharray="4 10" />
      {/* robô */}
      <g className="animate-floaty">
        <rect x="200" y="130" width="120" height="96" rx="30" fill="url(#hb)" />
        <rect x="216" y="150" width="88" height="54" rx="18" fill="#14142B" />
        <circle cx="242" cy="177" r="10" fill="#7CF5C4" />
        <circle cx="278" cy="177" r="10" fill="#7CF5C4" />
        <path d="M250 194q10 7 20 0" stroke="#7CF5C4" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M260 130v-22" stroke="#7C4DFF" strokeWidth="5" strokeLinecap="round" />
        <circle cx="260" cy="102" r="10" fill="#F0468F" />
        <rect x="214" y="236" width="92" height="88" rx="24" fill="white" stroke="#E9E8F0" strokeWidth="2" />
        <circle cx="260" cy="280" r="18" fill="url(#ho)" />
        <path d="M253 280l5 5 9-10" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="170" y="246" width="34" height="16" rx="8" fill="#2F6BFF" />
        <rect x="316" y="230" width="34" height="16" rx="8" fill="#2F6BFF" transform="rotate(-25 333 238)" />
        <rect x="228" y="330" width="20" height="30" rx="8" fill="#4E4B66" />
        <rect x="272" y="330" width="20" height="30" rx="8" fill="#4E4B66" />
      </g>
      {/* cards flutuantes */}
      <g transform="translate(46 96)">
        <rect width="120" height="74" rx="18" fill="white" stroke="#E9E8F0" />
        <circle cx="30" cy="37" r="16" fill="#F4EFFF" />
        <path d="M18 37c4-7 8-10 12-10s8 3 12 10c-4 7-8 10-12 10s-8-3-12-10Z" fill="#7C4DFF" />
        <rect x="54" y="26" width="50" height="8" rx="4" fill="#E8DDFF" />
        <rect x="54" y="40" width="34" height="8" rx="4" fill="#F4EFFF" />
      </g>
      <g transform="translate(372 120)">
        <rect width="110" height="74" rx="18" fill="white" stroke="#E9E8F0" />
        <path d="M20 46h20v-16h20v16h30" stroke="#FF7A1A" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="46" r="5" fill="#14142B" />
        <circle cx="90" cy="46" r="5" fill="#14142B" />
      </g>
      <g transform="translate(380 300)">
        <rect width="104" height="84" rx="18" fill="white" stroke="#E9E8F0" />
        <g transform="translate(52 42)">
          <Gear cx={0} cy={0} r={24} teeth={9} fill="#2F6BFF" />
          <circle r="8" fill="white" />
        </g>
      </g>
      <g transform="translate(40 300)">
        <rect width="118" height="70" rx="18" fill="white" stroke="#E9E8F0" />
        <path d="M22 50l18-18 14 10 24-22" stroke="#14B86A" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="94" cy="20" r="6" fill="#14B86A" />
      </g>
      <circle cx="120" cy="60" r="8" fill="#FFD23F" />
      <rect x="430" y="60" width="14" height="14" rx="4" fill="#F0468F" transform="rotate(20 437 67)" />
      <circle cx="460" cy="250" r="6" fill="#7C4DFF" />
      <path d="M90 230l6 12 12 6-12 6-6 12-6-12-12-6 12-6Z" fill="#FFD23F" />
    </svg>
  );
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#7C4DFF" />
            <stop offset=".55" stopColor="#2F6BFF" />
            <stop offset="1" stopColor="#14B86A" />
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="11" fill="url(#lg)" />
        <path d="M9 25V12l9 8 9-8v13" stroke="white" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="27" cy="9" r="3" fill="#FFD23F" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight text-ink">
        Mega<span className="bg-gradient-to-r from-grape-500 to-eletric-500 bg-clip-text text-transparent">Morfose</span>
      </span>
    </span>
  );
}
