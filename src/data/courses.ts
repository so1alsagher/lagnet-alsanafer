/**
 * ====== بيانات المواد (هون بتعدّل) ======
 * كل مادة = سطر واحد: [الرمز, الاسم, x, y, w, h]
 * x,y,w,h = مكان المربع على صورة الخطة بالبكسل (الصورة 1215×864) — الموقع بيحوّلها لنسب تلقائياً.
 *
 * الروابط: بملف `links` تحت. لكل مادة بتحط رابط لكل قسم (مجلد درايف، يوتيوب، ...).
 * أي قسم بدون رابط بيظهر "قريباً".
 */
export const IMG_W = 1215;
export const IMG_H = 864;
export const PLAN_IMAGE = '/materials.jpg';

export const SECTIONS = [
  { key: 'book', title: 'كتاب المادة وحلولها', desc: 'الكتاب المقرر مع حلول التمارين.' },
  { key: 'notes', title: 'ملخصات وشروحات', desc: 'ملخصات مختصرة وشروحات للمادة.' },
  { key: 'videos', title: 'فيديوهات', desc: 'شروحات فيديو للمادة.' },
  { key: 'midterm', title: 'أسئلة ميد', desc: 'نماذج وأسئلة سنوات سابقة للامتحان النصفي.' },
  { key: 'final', title: 'أسئلة فاينال', desc: 'نماذج وأسئلة سنوات سابقة للامتحان النهائي.' },
] as const;

export type SectionKey = (typeof SECTIONS)[number]['key'];
export type Course = {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  links: Partial<Record<SectionKey, string>>;
};

type Row = [string, string, number, number, number, number];

const ROWS: Row[] = [
  // العمود الأيمن: رياضيات / فيزياء / كيمياء
  ['calc1', 'التفاضل والتكامل 1', 1072, 80, 128, 75],
  ['stats', 'إحصاء واحتمالات', 822, 118, 140, 77],
  ['calc2', 'التفاضل والتكامل 2', 1072, 198, 128, 74],
  ['numerical', 'تقنيات عددية', 1072, 315, 136, 80],
  ['linear-algebra', 'جبر خطي', 908, 315, 137, 80],
  ['diff-eq1', 'معادلات تفاضلية 1', 742, 315, 138, 80],
  ['physics1', 'الفيزياء العامة 1', 1072, 440, 136, 75],
  ['physics1-lab', 'مختبر الفيزياء العامة 1', 742, 440, 138, 75],
  ['statics', 'استاتيكا', 1072, 565, 136, 80],
  ['physics2', 'الفيزياء العامة 2', 915, 565, 132, 80],
  ['physics2-lab', 'مختبر الفيزياء العامة 2', 742, 565, 138, 80],
  ['chemistry', 'الكيمياء العامة', 1072, 680, 136, 75],
  ['chemistry-lab', 'مختبر الكيمياء العامة 1', 742, 680, 138, 75],

  // أعمدة الحاسوب والمتطلبات العامة
  ['computer-remedial', 'حاسوب استدراكي', 558, 80, 134, 75],
  ['engineering-operator', 'مشغل هندسي', 380, 118, 135, 77],
  ['computer-skills', 'مهارات الحاسوب والتعلم الالكتروني', 558, 198, 134, 74],
  ['engineering-drawing', 'رسم هندسي', 558, 315, 134, 80],
  ['programming', 'البرمجة للمهندسين', 380, 315, 135, 80],
  ['engineering-economics', 'اقتصاد هندسي', 558, 440, 134, 75],
  ['national-education', 'التربية الوطنية', 380, 440, 135, 75],
  ['islamic-culture', 'ثقافة اسلامية', 558, 565, 134, 80],
  ['rashidun', 'خلفاء راشدين', 380, 565, 135, 80],

  // العمودان الأيسران: لغات ومتطلبات
  ['arabic-remedial', 'عربي استدراكي', 200, 80, 135, 75],
  ['english-remedial', 'انجليزي استدراكي', 33, 80, 135, 75],
  ['arabic-applied', 'عربي تطبيقي', 200, 198, 135, 74],
  ['english-applied1', 'انجليزي تطبيقي 1', 33, 198, 135, 74],
  ['innovation', 'الابتكار والريادة', 200, 315, 135, 80],
  ['english-applied2', 'انجليزي تطبيقي 2', 33, 315, 135, 80],
  ['military', 'علوم عسكرية', 200, 440, 135, 75],
  ['technical-writing', 'الكتابة التقنية والاخلاقيات', 33, 440, 135, 75],
  ['islam-life', 'اسلام وحياة', 200, 565, 135, 80],
  ['sports-health', 'رياضة وصحة', 33, 565, 135, 80],
];

/**
 * روابط المواد. مثال:
 * 'calc1': {
 *   book: 'https://drive.google.com/...',
 *   videos: 'https://youtube.com/playlist?list=...',
 * },
 */
const LINKS: Record<string, Partial<Record<SectionKey, string>>> = {
  // 'calc1': { book: '', notes: '', videos: '', midterm: '', final: '' },
};

export const COURSES: Course[] = ROWS.map(([id, name, x, y, w, h]) => ({
  id,
  name,
  x,
  y,
  w,
  h,
  links: LINKS[id] ?? {},
}));

export const courseHref = (id: string) => `#/course/${id}`;
export const findCourse = (id: string) => COURSES.find((c) => c.id === id);
