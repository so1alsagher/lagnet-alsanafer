import PageShell from './PageShell';

/**
 * ====== هون بتعدّل ======
 * كل عنصر بالقائمة = فقرة. اكتب تعريف اللجنة وأهدافها وطرق التواصل.
 */
const PARAGRAPHS = [
  'لجنة السنافر: اكتب هون تعريف قصير عن اللجنة ومين فيها.',
  'اكتب هون أهداف اللجنة والخدمات اللي بتقدمها للطلاب.',
  'اكتب هون طرق التواصل معكم (إنستغرام، واتساب، إيميل...).',
];

export default function AboutPage() {
  return (
    <PageShell title="من نحن">
      <div className="grid gap-4 text-lg" style={{ lineHeight: 1.9 }}>
        {PARAGRAPHS.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </PageShell>
  );
}
