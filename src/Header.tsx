import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { asset } from './pages/utils';

// روابط الهيدر: غيّر الاسم أو الرابط أو أضف سطر جديد
const NAV = [
  { label: 'التخصصات الجامعية', href: '#/majors' },
  { label: 'امتحانات المستوى', href: '#/exams' },
  { label: 'روابط جامعية', href: '#/uni-links' },
  { label: 'الخريطة الجامعية', href: '#/map' },
  { label: 'اعرف مدرسك', href: '#/teachers' },
  { label: 'من نحن', href: '#/about' },
];

export default function Header({ route }: { route: string }) {
  const [open, setOpen] = useState(false);

  // نسكّر قائمة الموبايل لما تتغير الصفحة
  useEffect(() => {
    setOpen(false);
  }, [route]);

  return (
    <header
      dir="rtl"
      lang="ar"
      className="sm-header sticky top-0 z-[100] w-full"
      style={{ fontFamily: "'Cairo', sans-serif", height: 'var(--header-h)', boxSizing: 'border-box' }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* اليمين: الشعار (يرجّع للرئيسية) + الروابط */}
        <div className="flex items-center gap-6">
          <a href="#/" aria-label="لجنة السنافر - الصفحة الرئيسية" className="flex items-center">
            <img
              src={asset('/logo.png')}
              alt="لجنة السنافر"
              draggable={false}
              style={{ height: 'calc(var(--header-h) - 20px)', width: 'auto' }}
            />
          </a>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="sm-nav-link" aria-current={route === n.href ? 'page' : undefined}>
                {n.label}
              </a>
            ))}
          </nav>
        </div>

        {/* الموبايل والتابلت: زر القائمة */}
        <button
          type="button"
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          className="flex h-10 w-10 items-center justify-center rounded-full lg:hidden"
          style={{ color: 'var(--sm-blue)' }}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={26} strokeWidth={2.5} /> : <Menu size={26} strokeWidth={2.5} />}
        </button>
      </div>

      {open && (
        <nav
          className="absolute inset-x-0 flex flex-col gap-1 bg-white px-4 pb-3 lg:hidden"
          style={{ top: 'var(--header-h)', borderBottom: '4px solid var(--sm-blue)' }}
        >
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="sm-nav-link"
              style={{ borderRadius: 12, padding: '12px 12px' }}
              aria-current={route === n.href ? 'page' : undefined}
            >
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
