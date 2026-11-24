import { useState } from 'react';
import { Search } from 'lucide-react';
import PageShell from './PageShell';
import ImageMap, { type Spot } from './ImageMap';
import LinkList from './LinkList';
import { COURSES, IMG_H, IMG_W, PLAN_IMAGE, courseHref } from '../data/courses';

// تحويل مكان كل مربع من بكسل إلى نسبة مئوية من الصورة
const SPOTS: Spot[] = COURSES.map((c) => ({
  label: c.name,
  href: courseHref(c.id),
  x: (c.x / IMG_W) * 100,
  y: (c.y / IMG_H) * 100,
  w: (c.w / IMG_W) * 100,
  h: (c.h / IMG_H) * 100,
}));

export default function MaterialsPage() {
  const [q, setQ] = useState('');
  const query = q.trim();
  const shown = COURSES.filter((c) => !query || c.name.includes(query));

  return (
    <PageShell
      wide
      title="المواد الدراسية"
      subtitle="اضغط على المادة من الخطة الشجرية لتفتح صفحتها."
    >
      <ImageMap src={PLAN_IMAGE} alt="الخطة الشجرية للمواد الهندسية المشتركة" spots={SPOTS} maxWidth={1100} />

      <h2 className="mb-3 mt-10 text-xl font-bold">كل المواد</h2>
      <div className="mb-4 flex items-center gap-3 rounded-full border border-white/40 bg-white/15 px-5 py-3">
        <Search size={20} strokeWidth={2.25} className="shrink-0" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن مادة..."
          aria-label="بحث عن مادة"
          className="w-full bg-transparent text-white outline-none placeholder:text-white/70"
        />
      </div>
      {shown.length ? (
        <LinkList items={shown.map((c) => ({ label: c.name, href: courseHref(c.id) }))} />
      ) : (
        <p className="py-8 text-center opacity-90">ما في نتائج مطابقة.</p>
      )}
    </PageShell>
  );
}
