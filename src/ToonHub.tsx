/**
 * index.html — داخل <html lang="ar" dir="rtl"> وضع الخطوط في الـ head:
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com" />
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
 * <link href="https://fonts.googleapis.com/css2?family=Lalezar&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
 *
 * الصور: انسخ مجلد public/icons كامل إلى مجلد public في مشروع Vite.
 * عدّل href لكل عنصر في ITEMS ليشير لرابط الخدمة الحقيقي.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const EASE = 'cubic-bezier(0.4,0,0.2,1)';
const DURATION = 650;

type Item = {
  src: string;
  ghost: string; // الكلمة الضخمة خلف الأيقونة
  ghostVw: number; // حجم الكلمة بوحدة vw (الكلمات الطويلة أصغر)
  title: string;
  desc: string;
  href: string;
  bg: string; // لون الخلفية (درجة أزرق)
  panel: string; // لون الكلمة الضخمة (أغمق من الخلفية)
};

const ITEMS: Item[] = [
  {
    src: '/icons/moodle.png',
    ghost: 'مودل',
    ghostVw: 30,
    title: 'منصة مودل',
    desc: 'ادخل إلى موادك ومحاضراتك وواجباتك من مكان واحد.',
    href: '#',
    bg: '#3A8DEB',
    panel: '#1D5FB5',
  },
  {
    src: '/icons/books.png',
    ghost: 'الكتب',
    ghostVw: 30,
    title: 'الكتب والمراجع',
    desc: 'كل ما تحتاجه من كتب ومراجع دراسية بين يديك.',
    href: '#',
    bg: '#2C7BD9',
    panel: '#14509E',
  },
  {
    src: '/icons/exams.png',
    ghost: 'الامتحانات',
    ghostVw: 17,
    title: 'امتحانات المستوى',
    desc: 'تعرّف على مواعيد امتحانات المستوى ونماذج منها للتدرّب.',
    href: '#',
    bg: '#4A9BF0',
    panel: '#2467BD',
  },
  {
    src: '/icons/portal.png',
    ghost: 'البوابة',
    ghostVw: 24,
    title: 'بوابة الطالب',
    desc: 'سجّل دخولك لإدارة بياناتك وخدماتك الجامعية.',
    href: '#',
    bg: '#1E6AC8',
    panel: '#0F4690',
  },
  {
    src: '/icons/majors.png',
    ghost: 'التخصصات',
    ghostVw: 19,
    title: 'التخصصات الجامعية',
    desc: 'استعرض التخصصات المتاحة وتفاصيل كل برنامج.',
    href: '#',
    bg: '#3278D6',
    panel: '#1A58A8',
  },
  {
    src: '/icons/links.png',
    ghost: 'روابط',
    ghostVw: 28,
    title: 'مواقع أخرى',
    desc: 'روابط مفيدة لمواقع وخدمات إضافية.',
    href: '#',
    bg: '#5AA6F2',
    panel: '#2D74C4',
  },
];

const N = ITEMS.length;

type Role = 'center' | 'left' | 'right' | 'farLeft' | 'farRight' | 'back';

// الفرق عن العنصر النشط -> الدور.
// في الواجهة العربية (RTL): "التالي" على اليسار و"السابق" على اليمين.
const ROLE_BY_OFFSET: Role[] = ['center', 'left', 'farLeft', 'back', 'farRight', 'right'];

export default function ToonHub() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const lock = useRef(false);

  useEffect(() => {
    ITEMS.forEach((it) => {
      const img = new Image();
      img.src = it.src;
    });
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navigate = useCallback((dir: 'next' | 'prev') => {
    if (lock.current) return;
    lock.current = true;
    setActiveIndex((i) => (dir === 'next' ? (i + 1) % N : (i + N - 1) % N));
    window.setTimeout(() => {
      lock.current = false;
    }, DURATION);
  }, []);

  // الأسهم من لوحة المفاتيح (يسار = التالي في RTL)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate('next');
      if (e.key === 'ArrowRight') navigate('prev');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const roleOf = (i: number): Role => ROLE_BY_OFFSET[(i - activeIndex + N) % N];

  const itemStyle = (role: Role): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      aspectRatio: '1 / 1',
      transition: `transform ${DURATION}ms ${EASE}, filter ${DURATION}ms ${EASE}, opacity ${DURATION}ms ${EASE}, left ${DURATION}ms ${EASE}`,
      willChange: 'transform, filter, opacity',
    };
    switch (role) {
      case 'center':
        return {
          ...base,
          transform: `translateX(-50%) scale(${isMobile ? 1.15 : 1.3})`,
          transformOrigin: 'bottom center',
          filter: 'blur(0px)',
          opacity: 1,
          zIndex: 20,
          left: '50%',
          height: isMobile ? '44%' : '62%',
          bottom: isMobile ? '26%' : '6%',
        };
      case 'left':
      case 'right':
        return {
          ...base,
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(2px)',
          opacity: 0.85,
          zIndex: 10,
          left: role === 'left' ? (isMobile ? '16%' : '20%') : isMobile ? '84%' : '80%',
          height: isMobile ? '14%' : '24%',
          bottom: isMobile ? '36%' : '16%',
        };
      case 'farLeft':
      case 'farRight':
        return {
          ...base,
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(4px)',
          opacity: isMobile ? 0 : 0.6,
          zIndex: 6,
          left: role === 'farLeft' ? '7%' : '93%',
          height: isMobile ? '10%' : '18%',
          bottom: isMobile ? '38%' : '18%',
        };
      default: // back
        return {
          ...base,
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(4px)',
          opacity: isMobile ? 0 : 0.5,
          zIndex: 5,
          left: '50%',
          height: isMobile ? '10%' : '18%',
          bottom: isMobile ? '38%' : '18%',
        };
    }
  };

  const grain = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.08'/></svg>")`;

  const circleBtn =
    'w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white bg-transparent text-white flex items-center justify-center cursor-pointer hover:scale-[1.08] hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

  const active = ITEMS[activeIndex];

  return (
    <div
      dir="rtl"
      lang="ar"
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: active.bg,
        transition: `background-color ${DURATION}ms ${EASE}`,
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      <div className="relative w-full" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* حبيبات */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 50,
            opacity: 0.4,
            backgroundImage: grain,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* الكلمة الضخمة خلف الأيقونة */}
        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
          style={{
            zIndex: 2,
            top: '12%',
            fontFamily: "'Lalezar', sans-serif",
            fontSize: `clamp(70px, ${active.ghostVw}vw, 380px)`,
            fontWeight: 400,
            color: active.panel,
            transition: `color ${DURATION}ms ${EASE}`,
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
          }}
        >
          {active.ghost}
        </div>

        {/* الشعار */}
        <div
          className="absolute top-6 start-4 sm:start-8 text-white text-sm font-bold"
          style={{ zIndex: 60, opacity: 0.9 }}
        >
          بوابة الخدمات
        </div>

        {/* الكاروسيل */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {ITEMS.map((it, i) => (
            <div key={it.src} style={itemStyle(roleOf(i))}>
              <img
                src={it.src}
                alt={it.title}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'bottom center',
                }}
              />
            </div>
          ))}
        </div>

        {/* النص والأزرار */}
        <div
          className="absolute bottom-6 start-4 sm:bottom-20 sm:start-24"
          style={{ zIndex: 60, maxWidth: 320 }}
        >
          <p
            className="mb-2 sm:mb-3 text-lg sm:text-[26px] font-bold text-white"
            style={{ opacity: 0.95 }}
          >
            {active.title}
          </p>
          <p
            className="hidden sm:block text-sm text-white mb-4 sm:mb-5"
            style={{ opacity: 0.9, lineHeight: 1.8 }}
          >
            {active.desc}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="السابق"
              className={circleBtn}
              style={{ transition: 'transform 150ms, background-color 150ms' }}
              onClick={() => navigate('prev')}
            >
              <ArrowRight size={26} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              aria-label="التالي"
              className={circleBtn}
              style={{ transition: 'transform 150ms, background-color 150ms' }}
              onClick={() => navigate('next')}
            >
              <ArrowLeft size={26} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        {/* رابط افتح */}
        <div className="absolute bottom-6 end-4 sm:bottom-20 sm:end-10" style={{ zIndex: 60 }}>
          <a
            href={active.href}
            className="flex items-center gap-2 text-white no-underline opacity-95 hover:opacity-100"
            style={{
              fontFamily: "'Lalezar', sans-serif",
              fontSize: 'clamp(22px, 4vw, 56px)',
              fontWeight: 400,
              lineHeight: 1,
              transition: 'opacity 200ms',
            }}
          >
            افتح
            <ArrowLeft className="w-5 h-5 sm:w-8 sm:h-8" strokeWidth={2.25} />
          </a>
        </div>
      </div>
    </div>
  );
}
