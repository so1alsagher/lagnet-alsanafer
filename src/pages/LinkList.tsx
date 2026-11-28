import { ArrowLeft } from 'lucide-react';
import { linkProps } from './utils';

export type { LinkItem } from '../data/content';
import type { LinkItem } from '../data/content';

// قائمة بطاقات، كل بطاقة رابط (إذا الرابط فاضي بتظهر "قريباً" وما بتنضغط)
export default function LinkList({ items }: { items: LinkItem[] }) {
  return (
    <div className="grid gap-4">
      {items.map((it, i) => {
        const body = (
          <>
            <span>
              <span className="sm-card-title">{it.label}</span>
              {(it.desc || !it.href) && <span className="sm-card-desc">{it.desc || 'قريباً'}</span>}
            </span>
            {it.href && <ArrowLeft size={22} strokeWidth={2.5} className="shrink-0" />}
          </>
        );
        return it.href ? (
          <a key={`${it.label}-${i}`} href={it.href} {...linkProps(it.href)} className="sm-card">
            {body}
          </a>
        ) : (
          <div key={`${it.label}-${i}`} className="sm-card sm-card-off">
            {body}
          </div>
        );
      })}
    </div>
  );
}
