import { linkProps, asset } from './utils';

// منطقة قابلة للضغط فوق الصورة. القيم كلها نسب مئوية من حجم الصورة:
// x = البعد عن الحافة اليسرى، y = البعد عن الأعلى، w = العرض، h = الارتفاع
export type Spot = {
  label: string;
  href: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

type Props = {
  src: string;
  alt: string;
  spots: Spot[];
  maxWidth?: number;
};

export default function ImageMap({ src, alt, spots, maxWidth = 560 }: Props) {
  return (
    <div className="relative mx-auto" style={{ maxWidth }}>
      <img src={asset(src)} alt={alt} draggable={false} className="block h-auto w-full select-none" />
      {spots.map((s) => (
        <a
          key={s.label}
          href={s.href}
          {...linkProps(s.href)}
          aria-label={s.label}
          title={s.label}
          className="group absolute rounded-xl transition hover:bg-white/25 focus-visible:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }}
        >
          <span
            className="pointer-events-none absolute whitespace-nowrap rounded-full bg-white px-3 py-1 text-sm font-bold opacity-0 transition group-hover:opacity-100"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#14509E' }}
          >
            {s.label}
          </span>
        </a>
      ))}
    </div>
  );
}
