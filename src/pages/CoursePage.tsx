import { ArrowLeft, ArrowRight } from 'lucide-react';
import PageShell from './PageShell';
import { SECTIONS, findCourse } from '../data/courses';
import { useContent } from '../data/content';
import { linkProps } from './utils';

// صفحة المادة: 5 أقسام (كتاب، ملخصات، فيديوهات، ميد، فاينال)
export default function CoursePage({ id }: { id: string }) {
  const course = findCourse(id);
  const links = useContent().courses[id] ?? {};

  if (!course) {
    return (
      <PageShell title="المادة غير موجودة">
        <a href="#/materials" className="font-bold underline">رجوع للمواد</a>
      </PageShell>
    );
  }

  return (
    <PageShell title={course.name} subtitle="اختر القسم الذي تريده.">
      <a href="#/materials" className="mb-6 inline-flex items-center gap-2 font-bold no-underline" style={{ color: 'var(--sm-mid)' }}>
        <ArrowRight size={18} strokeWidth={2.5} /> رجوع للخطة الشجرية
      </a>
      <div className="grid gap-4">
        {SECTIONS.map((s) => {
          const href = links[s.key];
          const body = (
            <>
              <span>
                <span className="sm-card-title">{s.title}</span>
                <span className="sm-card-desc">{href ? s.desc : 'قريباً'}</span>
              </span>
              {href && <ArrowLeft size={22} strokeWidth={2.5} className="shrink-0" />}
            </>
          );
          return href ? (
            <a key={s.key} href={href} {...linkProps(href)} className="sm-card">
              {body}
            </a>
          ) : (
            <div key={s.key} className="sm-card sm-card-off" aria-disabled="true">
              {body}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
