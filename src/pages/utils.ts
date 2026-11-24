// الروابط الخارجية (تبدأ بـ http) بتنفتح بتبويب جديد، والداخلية (#/...) بتنفتح بنفس الصفحة
export function linkProps(href: string): { target?: string; rel?: string } {
  return /^https?:/i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

// مسار الصور/الملفات داخل public. بيشتغل حتى لو الموقع منشور داخل مجلد فرعي (مثل GitHub Pages: user.github.io/repo/)
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL;
  return path.startsWith('/') ? `${base.endsWith('/') ? base : base + '/'}${path.slice(1)}` : path;
}
