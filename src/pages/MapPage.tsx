import PageShell from './PageShell';
import { assetPath } from './utils';

/**
 * ====== هون بتعدّل ======
 * MAP_IMAGE: مسار صورة الخريطة. حطها داخل مجلد public وسمّها مثلاً map.png
 * وبعدين اكتب هون: '/map.png'. وإذا خليته فاضي بتظهر رسالة "قريباً".
 */
const MAP_IMAGE: string = '';

export default function MapPage() {
  return (
    <PageShell title="الخريطة الجامعية" subtitle="تعرّف على أماكن الكليات والمباني داخل الحرم الجامعي.">
      {MAP_IMAGE ? (
        <img src={assetPath(MAP_IMAGE)} alt="الخريطة الجامعية" className="mx-auto block h-auto w-full rounded-2xl" />
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-white/60 text-lg font-bold">
          سيتم إضافة الخريطة قريباً
        </div>
      )}
    </PageShell>
  );
}
