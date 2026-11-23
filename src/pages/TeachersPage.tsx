import { useState } from 'react';
import { Search } from 'lucide-react';
import PageShell from './PageShell';
import LinkList, { type LinkItem } from './LinkList';

/**
 * ====== هون بتعدّل ======
 * كل سطر = مدرس. label = الاسم، desc = القسم أو الكلية، href = رابط (صفحته أو إيميله).
 * انسخ سطر لتضيف مدرس جديد.
 */
const TEACHERS: LinkItem[] = [
  { label: 'اسم المدرس الأول', desc: 'القسم / الكلية', href: '#/teachers' },
  { label: 'اسم المدرس الثاني', desc: 'القسم / الكلية', href: '#/teachers' },
  { label: 'اسم المدرس الثالث', desc: 'القسم / الكلية', href: '#/teachers' },
];

export default function TeachersPage() {
  const [q, setQ] = useState('');
  const query = q.trim();
  const shown = query
    ? TEACHERS.filter((t) => `${t.label} ${t.desc ?? ''}`.includes(query))
    : TEACHERS;

  return (
    <PageShell title="اعرف مدرسك" subtitle="ابحث عن المدرس بالاسم أو بالقسم.">
      <div className="mb-6 flex items-center gap-3 rounded-full border border-white/40 bg-white/15 px-5 py-3">
        <Search size={20} strokeWidth={2.25} className="shrink-0" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث هنا..."
          aria-label="بحث عن مدرس"
          className="w-full bg-transparent text-white outline-none placeholder:text-white/70"
        />
      </div>
      {shown.length ? (
        <LinkList items={shown} />
      ) : (
        <p className="py-8 text-center opacity-90">ما في نتائج مطابقة.</p>
      )}
    </PageShell>
  );
}
