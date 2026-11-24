import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
};

// الإطار المشترك لكل الصفحات الداخلية: خلفية زرقاء + عنوان
export default function PageShell({ title, subtitle, children, wide }: Props) {
  return (
    <div
      dir="rtl"
      lang="ar"
      className="w-full text-white"
      style={{
        backgroundColor: '#2C7BD9',
        fontFamily: "'Cairo', sans-serif",
        minHeight: 'calc(100vh - var(--header-h))',
      }}
    >
      <div className={`mx-auto ${wide ? 'max-w-5xl' : 'max-w-3xl'} px-4 py-8 sm:py-12`}>
        <h1
          className="text-4xl sm:text-6xl"
          style={{ fontFamily: "'Lalezar', sans-serif", fontWeight: 400, lineHeight: 1.2 }}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-base opacity-90">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
