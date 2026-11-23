// الروابط الخارجية (تبدأ بـ http) بتنفتح بتبويب جديد، والداخلية (#/...) بتنفتح بنفس الصفحة
export function linkProps(href: string): { target?: string; rel?: string } {
  return /^https?:/i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}
