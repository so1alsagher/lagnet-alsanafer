// المسارات داخل public تبدأ بـ / (مثل /logo.png). نضيف لها الـ base بتاع Vite
// عشان تشتغل تحت /اسم-المستودع/ على GitHub Pages، وتشتغل محلياً كمان.
export function assetPath(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

// الروابط الخارجية (تبدأ بـ http) بتنفتح بتبويب جديد، والداخلية (#/...) بتنفتح بنفس الصفحة
export function linkProps(href: string): { target?: string; rel?: string } {
  return /^https?:/i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}
