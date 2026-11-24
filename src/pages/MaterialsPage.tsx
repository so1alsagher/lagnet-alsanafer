import PageShell from './PageShell';
import ImageMap, { type Spot } from './ImageMap';
import LinkList from './LinkList';

/**
 * ====== هون بتعدّل ======
 * IMAGE: مسار الصورة (حطها داخل مجلد public وسمّها هيك: '/materials.png').
 * SPOTS: المناطق القابلة للضغط على الصورة. لكل منطقة:
 *   label = الاسم، href = الرابط، x و y و w و h = المكان والحجم كنسب مئوية من الصورة.
 * حالياً مجرد مثال على صورة الكتب: كل كتاب إله رابط. بدّل الروابط والأسماء.
 */
const IMAGE = '/icons/books.png';

const SPOTS: Spot[] = [
  { label: 'المادة الأولى', href: '#/materials', x: 0, y: 40, w: 100, h: 22 },
  { label: 'المادة الثانية', href: '#/materials', x: 0, y: 62, w: 100, h: 18 },
  { label: 'المادة الثالثة', href: '#/materials', x: 0, y: 80, w: 100, h: 20 },
];

export default function MaterialsPage() {
  return (
    <PageShell title="المواد الدراسية" subtitle="اضغط على الصورة لتفتح الرابط المطلوب.">
      <ImageMap src={IMAGE} alt="المواد الدراسية" spots={SPOTS} />

      {/* نفس الروابط كقائمة تحت الصورة (أسهل على الموبايل) */}
      <h2 className="mb-3 mt-10 text-xl font-bold">الروابط</h2>
      <LinkList items={SPOTS.map((s) => ({ label: s.label, href: s.href }))} />
    </PageShell>
  );
}
