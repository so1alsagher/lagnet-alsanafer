import PageShell from './PageShell';
import LinkList, { type LinkItem } from './LinkList';

/**
 * ====== هون بتعدّل ======
 * كل سطر = بطاقة. غيّر الاسم والوصف والرابط، وانسخ سطر لتضيف بطاقة جديدة.
 */
const MAJORS: LinkItem[] = [
  { label: 'اسم التخصص الأول', desc: 'وصف قصير عن التخصص', href: '#/majors' },
  { label: 'اسم التخصص الثاني', desc: 'وصف قصير عن التخصص', href: '#/majors' },
  { label: 'اسم التخصص الثالث', desc: 'وصف قصير عن التخصص', href: '#/majors' },
];

export default function MajorsPage() {
  return (
    <PageShell title="التخصصات الجامعية" subtitle="اختر التخصص لتشوف تفاصيله.">
      <LinkList items={MAJORS} />
    </PageShell>
  );
}
