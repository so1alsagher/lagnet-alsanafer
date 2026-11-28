import { useSyncExternalStore } from 'react';
import { asset } from '../pages/utils';

/**
 * ====== محتوى الموقع القابل للتعديل من لوحة الأدمن ======
 * كل شي هون بينحفظ بملف public/content.json (لوحة الأدمن #/admin بتعدّله وبتحفظه على GitHub).
 * القيم اللي هون هي الافتراضية لو الملف مش موجود أو فيه نقص.
 */
export type SectionKey = 'book' | 'notes' | 'videos' | 'midterm' | 'final';
export type LinkItem = { label: string; href: string; desc?: string };
export type ListKey = 'majors' | 'exams' | 'uniLinks' | 'otherSites' | 'teachers';

export type Content = {
  courses: Record<string, Partial<Record<SectionKey, string>>>;
  hub: { moodle: string; portal: string };
  social: { youtube: string; whatsapp: string; instagram: string; facebook: string };
  lists: Record<ListKey, LinkItem[]>;
};

export const LIST_TITLES: Record<ListKey, string> = {
  majors: 'التخصصات الجامعية',
  exams: 'امتحانات المستوى',
  uniLinks: 'روابط جامعية',
  otherSites: 'مواقع أخرى',
  teachers: 'اعرف مدرسك',
};

export const DEFAULT_CONTENT: Content = {
  courses: {},
  hub: { moodle: '', portal: '' },
  social: { youtube: '', whatsapp: '', instagram: '', facebook: '' },
  lists: { majors: [], exams: [], uniLinks: [], otherSites: [], teachers: [] },
};

// دمج ملف المحتوى فوق الافتراضي (وأي حقل ناقص أو غلط بينتجاهل)
export function mergeContent(raw: unknown): Content {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Content>;
  const d = DEFAULT_CONTENT;
  const lists = { ...d.lists };
  (Object.keys(lists) as ListKey[]).forEach((k) => {
    const v = r.lists?.[k];
    if (Array.isArray(v)) {
      lists[k] = v
        .filter((x) => x && typeof x.label === 'string')
        .map((x) => ({ label: x.label, href: String(x.href ?? ''), desc: x.desc ? String(x.desc) : undefined }));
    }
  });
  return {
    courses: r.courses && typeof r.courses === 'object' ? r.courses : {},
    hub: { ...d.hub, ...(r.hub ?? {}) },
    social: { ...d.social, ...(r.social ?? {}) },
    lists,
  };
}

// ---- مخزن بسيط (بدون مكتبات) ----
let current: Content = DEFAULT_CONTENT;
const listeners = new Set<() => void>();

export function setContent(c: Content) {
  current = c;
  listeners.forEach((l) => l());
}

export function useContent(): Content {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
  );
}

// تحميل الملف مرة وحدة عند فتح الموقع
export async function loadContent() {
  try {
    const res = await fetch(`${asset('/content.json')}?t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) setContent(mergeContent(await res.json()));
  } catch {
    /* بنكمل بالافتراضي */
  }
}
