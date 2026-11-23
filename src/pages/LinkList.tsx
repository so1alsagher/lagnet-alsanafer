import { ArrowLeft } from 'lucide-react';
import { linkProps } from './utils';

export type LinkItem = { label: string; href: string; desc?: string };

// قائمة بطاقات، كل بطاقة رابط
export default function LinkList({ items }: { items: LinkItem[] }) {
  return (
    <div className="grid gap-3">
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          {...linkProps(it.href)}
          className="flex items-center justify-between gap-4 rounded-2xl border border-white/40 bg-white/15 px-5 py-4 text-white no-underline transition hover:bg-white/25"
        >
          <span>
            <span className="block text-lg font-bold">{it.label}</span>
            {it.desc && <span className="mt-1 block text-sm opacity-85">{it.desc}</span>}
          </span>
          <ArrowLeft size={22} strokeWidth={2.25} className="shrink-0" />
        </a>
      ))}
    </div>
  );
}
