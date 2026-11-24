import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { asset } from './pages/utils';

// روابط الهيدر: غيّر الاسم أو الرابط أو أضف سطر جديد
const NAV = [
  { label: 'الخريطة الجامعية', href: '#/map' },
  { label: 'اعرف مدرسك', href: '#/teachers' },
  { label: 'من نحن', href: '#/about' },
];

const BLUE = '#1D5FB5';

export default function Header({ route }: { route: string }) {
  const [open, setOpen] = useState(false);

  // نسكّر قائمة الموبايل لما تتغير الصفحة
  useEffect(() => {
    setOpen(false);
  }, [route]);

  const linkClass = (href: string) =>
    `no-underline text-base font-semibold transition-colors ${
      route === href ? 'font-bold' : 'hover:opacity-70'
    }`;
  const linkStyle = (href: string): React.CSSProperties => ({
    color: route === href ? BLUE : '#334155',
  });

  return (
    <header
      dir="rtl"
      lang="ar"
      className="sticky top-0 z-[100] w-full bg-white shadow-sm"
      style={{ fontFamily: "'Cairo', sans-serif", height: 'var(--header-h)' }}
    >
      <div className="flex h-full w-full items-center justify-between px-4 sm:px-6">
        {/* اليمين: اسم اللجنة (يرجّع للرئيسية) + الروابط */}
        <div className="flex items-center gap-8">
          <a href="#/" aria-label="لجنة السنافر - الصفحة الرئيسية" className="flex items-center">
            <img
              src={asset('/logo.png')}
              alt="لجنة السنافر"
              draggable={false}
              style={{ height: 'calc(var(--header-h) - 12px)', width: 'auto' }}
            />
          </a>
          <nav className="hidden items-center gap-6 sm:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className={linkClass(n.href)} style={linkStyle(n.href)}>
                {n.label}
              </a>
            ))}
          </nav>
        </div>

        {/* الموبايل: زر القائمة */}
        <button
          type="button"
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          className="flex h-10 w-10 items-center justify-center rounded-full sm:hidden"
          style={{ color: BLUE }}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={26} strokeWidth={2.25} /> : <Menu size={26} strokeWidth={2.25} />}
        </button>
      </div>

      {open && (
        <nav className="absolute inset-x-0 flex flex-col gap-1 bg-white px-4 pb-3 shadow-md sm:hidden"
          style={{ top: 'var(--header-h)' }}
        >
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className={`${linkClass(n.href)} rounded-lg px-2 py-3`}
              style={linkStyle(n.href)}
            >
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
