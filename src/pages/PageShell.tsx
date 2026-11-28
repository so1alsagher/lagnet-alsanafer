import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
};

// الإطار المشترك لكل الصفحات الداخلية: خلفية فاتحة بنقاط زرقاء + عنوان بهوية اللجنة
export default function PageShell({ title, subtitle, children, wide }: Props) {
  return (
    <div dir="rtl" lang="ar" className="sm-page sm-dots w-full" style={{ minHeight: 'var(--page-h)' }}>
      <div className={`relative mx-auto ${wide ? 'max-w-5xl' : 'max-w-3xl'} px-4 py-8 sm:py-12`} style={{ zIndex: 1 }}>
        <h1 className="sm-title text-4xl sm:text-6xl">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-base font-semibold" style={{ color: 'var(--sm-mid)' }}>
            {subtitle}
          </p>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
