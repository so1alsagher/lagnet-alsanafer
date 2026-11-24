import { ArrowLeft, ArrowRight } from 'lucide-react';
import PageShell from './PageShell';
import { SECTIONS, findCourse } from '../data/courses';
import { linkProps } from './utils';

// صفحة المادة: 5 أقسام (كتاب، ملخصات، فيديوهات، ميد، فاينال)
export default function CoursePage({ id }: { id: string }) {
  const course = findCourse(id);

  if (!course) {
    return (
      <PageShell title="المادة غير موجودة">
        <a href="#/materials" className="underline">رجوع للمواد</a>
      </PageShell>
    );
  }

  return (
    <PageShell title={course.name} subtitle="اختر القسم الذي تريده.">
      <a href="#/materials" className="mb-6 inline-flex items-center gap-2 text-white/90 no-underline hover:text-white">
        <ArrowRight size={18} strokeWidth={2.25} /> رجوع للخطة الشجرية
      </a>
      <div className="grid gap-3">
        {SECTIONS.map((s) => {
          const href = course.links[s.key];
          const base = 'flex items-center justify-between gap-4 rounded-2xl border border-white/40 px-5 py-4 text-white no-underline';
          const body = (
            <>
              <span>
                <span className="block text-lg font-bold">{s.title}</span>
                <span className="mt-1 block text-sm opacity-85">{href ? s.desc : 'قريباً'}</span>
              </span>
              {href && <ArrowLeft size={22} strokeWidth={2.25} className="shrink-0" />}
            </>
          );
          return href ? (
            <a key={s.key} href={href} {...linkProps(href)} className={`${base} bg-white/15 transition hover:bg-white/25`}>
              {body}
            </a>
          ) : (
            <div key={s.key} className={`${base} bg-white/5 opacity-60`} aria-disabled="true">
              {body}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
