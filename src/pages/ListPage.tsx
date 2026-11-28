import { useState } from 'react';
import { Search } from 'lucide-react';
import PageShell from './PageShell';
import LinkList from './LinkList';
import { LIST_TITLES, useContent, type ListKey } from '../data/content';

type Props = { listKey: ListKey; subtitle?: string; search?: boolean };

// صفحة قائمة عامة: المحتوى بيجي من لوحة الأدمن (#/admin)
export default function ListPage({ listKey, subtitle, search }: Props) {
  const items = useContent().lists[listKey];
  const [q, setQ] = useState('');
  const query = q.trim();
  const shown = query ? items.filter((t) => `${t.label} ${t.desc ?? ''}`.includes(query)) : items;

  return (
    <PageShell title={LIST_TITLES[listKey]} subtitle={subtitle}>
      {search && (
        <div className="mb-6 flex items-center gap-3 sm-input" style={{ borderRadius: 999 }}>
          <Search size={20} strokeWidth={2.5} className="shrink-0" style={{ color: 'var(--sm-blue)' }} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث هنا..."
            aria-label="بحث"
            className="w-full bg-transparent outline-none"
            style={{ color: 'var(--sm-navy)' }}
          />
        </div>
      )}
      {shown.length ? (
        <LinkList items={shown} />
      ) : (
        <div className="sm-card sm-card-off justify-center text-lg font-bold">
          {items.length ? 'ما في نتائج مطابقة.' : 'سيتم إضافة المحتوى قريباً.'}
        </div>
      )}
    </PageShell>
  );
}
