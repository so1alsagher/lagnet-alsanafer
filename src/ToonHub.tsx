/**
 * index.html — داخل <html lang="ar" dir="rtl"> وضع الخطوط في الـ head:
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com" />
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
 * <link href="https://fonts.googleapis.com/css2?family=Lalezar&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
 *
 * الصور: انسخ مجلد public/icons كامل إلى مجلد public في مشروع Vite.
 * روابط مودل وبوابة الطالب بتتعدّل من لوحة الأدمن (#/admin).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { linkProps, asset } from './pages/utils';
import { useContent } from './data/content';

const EASE = 'cubic-bezier(0.22,1,0.36,1)';
const DURATION = 800;

type Item = {
  id: 'moodle' | 'materials' | 'portal' | 'other';
  src: string;
  ghost: string; // الكلمة الضخمة خلف الأيقونة
  ghostVw: number; // حجم الكلمة بوحدة vw (الكلمات الطويلة أصغر)
  title: string;
  desc: string;
  href?: string; // رابط ثابت (إذا ما انحط بيجي من لوحة الأدمن)
  bg: string; // لون الخلفية (أزرق فاتح)
  panel: string; // لون الكلمة الضخمة (أغمق شوي من الخلفية)
};

// 4 أيقونات: المواد الدراسية، مودل، بوابة الطالب، مواقع أخرى
const ITEMS: Item[] = [
  {
    id: 'moodle',
    src: '/icons/moodle.png',
    ghost: 'مودل',
    ghostVw: 30,
    title: 'منصة مودل',
    desc: 'ادخل إلى موادك ومحاضراتك وواجباتك من مكان واحد.',
    bg: '#E3F2FE',
    panel: '#B7DAF8',
  },
  {
    id: 'materials',
    src: '/icons/books.png',
    ghost: 'المواد',
    ghostVw: 24,
    title: 'المواد الدراسية',
    desc: 'كل ما تحتاجه من مواد ومراجع دراسية بين يديك.',
    href: '#/materials',
    bg: '#D6EBFC',
    panel: '#A8D2F6',
  },
  {
    id: 'portal',
    src: '/icons/portal.png',
    ghost: 'البوابة',
    ghostVw: 24,
    title: 'بوابة الطالب',
    desc: 'سجّل دخولك لإدارة بياناتك وخدماتك الجامعية.',
    bg: '#DDEFFD',
    panel: '#B0D6F7',
  },
  {
    id: 'other',
    src: '/icons/links.png',
    ghost: 'روابط',
    ghostVw: 28,
    title: 'مواقع أخرى',
    desc: 'روابط مفيدة لمواقع وخدمات إضافية.',
    href: '#/other-sites',
    bg: '#CDE6FB',
    panel: '#A0CDF4',
  },
];

const N = ITEMS.length;

type Role = 'center' | 'left' | 'right' | 'farLeft' | 'farRight' | 'back';

// الفرق عن العنصر النشط -> الدور.
// في الواجهة العربية (RTL): "التالي" على اليسار و"السابق" على اليمين.
function roleForOffset(d: number): Role {
  if (d === 0) return 'center';
  if (d === 1) return 'left';
  if (d === N - 1) return 'right';
  if (N > 4) {
    if (d === 2) return 'farLeft';
    if (d === N - 2) return 'farRight';
  }
  return 'back';
}

export default function ToonHub() {
  const { hub } = useContent();
  const hrefOf = (it: Item) => (it.id === 'moodle' ? hub.moodle : it.id === 'portal' ? hub.portal : it.href) || '#';

  // نتذكر الأيقونة الحالية عشان لما ترجع من صفحة داخلية تلاقي نفس المكان
  const [activeIndex, setActiveIndex] = useState(() => {
    try {
      const v = Number(sessionStorage.getItem('toonhub-index'));
      return Number.isInteger(v) && v >= 0 && v < N ? v : 0;
    } catch {
      return 0;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem('toonhub-index', String(activeIndex));
    } catch {
      /* تجاهل */
    }
  }, [activeIndex]);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const lock = useRef(false);

  useEffect(() => {
    ITEMS.forEach((it) => {
      const img = new Image();
      img.src = asset(it.src);
    });
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const unlockSoon = () => {
    lock.current = true;
    window.setTimeout(() => {
      lock.current = false;
    }, 350); // الحركة بتكمل بنعومة حتى لو ضغطت بسرعة
  };

  const navigate = useCallback((dir: 'next' | 'prev') => {
    if (lock.current) return;
    unlockSoon();
    setActiveIndex((i) => (dir === 'next' ? (i + 1) % N : (i + N - 1) % N));
  }, []);

  const goTo = useCallback((i: number) => {
    if (lock.current) return;
    unlockSoon();
    setActiveIndex(i);
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

  // سحب بالإصبع: يسار = التالي، يمين = السابق
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) navigate(dx < 0 ? 'next' : 'prev');
  };

  const roleOf = (i: number): Role => roleForOffset((i - activeIndex + N) % N);

  const itemStyle = (role: Role): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      aspectRatio: '1 / 1',
      transformOrigin: 'bottom center',
      transition: ['transform', 'filter', 'opacity', 'left', 'height', 'bottom']
        .map((p) => `${p} ${DURATION}ms ${EASE}`)
        .join(', '),
      willChange: 'transform, filter, opacity, left, height, bottom',
    };
    switch (role) {
      case 'center':
        return {
          ...base,
          transform: `translateX(-50%) scale(${isMobile ? 1.15 : 1.3})`,
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
          opacity: 0,
          zIndex: 5,
          left: '50%',
          height: isMobile ? '10%' : '18%',
          bottom: isMobile ? '38%' : '18%',
        };
    }
  };

  const active = ITEMS[activeIndex];

  return (
    <div
      dir="rtl"
      lang="ar"
      className="sm-page sm-dots w-full"
      style={{
        backgroundColor: active.bg,
        backgroundImage: 'none',
        transition: `background-color ${DURATION}ms ${EASE}`,
      }}
    >
      <div
        className="relative w-full"
        style={{ height: 'var(--page-h)', minHeight: 420, overflow: 'hidden', touchAction: 'pan-y' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* الكلمة الضخمة خلف الأيقونة (كل الكلمات موجودة والنشطة بس ظاهرة، فبتتبدل بتلاشي ناعم) */}
        {ITEMS.map((it, i) => (
          <div
            key={it.ghost}
            className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
            style={{
              zIndex: 2,
              top: '12%',
              fontFamily: "'Lalezar', sans-serif",
              fontSize: `clamp(70px, ${it.ghostVw}vw, 380px)`,
              fontWeight: 400,
              color: it.panel,
              opacity: i === activeIndex ? 1 : 0,
              transform: i === activeIndex ? 'scale(1)' : 'scale(0.94)',
              transition: `opacity ${DURATION}ms ${EASE}, transform ${DURATION}ms ${EASE}`,
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}
          >
            {it.ghost}
          </div>
        ))}

        {/* الكاروسيل: كل أيقونة مربع كامل قابل للضغط (hitbox) */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {ITEMS.map((it, i) => {
            const role = roleOf(i);
            const isCenter = role === 'center';
            const clickable = isCenter || role === 'left' || role === 'right' || role === 'farLeft' || role === 'farRight';
            const href = hrefOf(it);
            return (
              <a
                key={it.id}
                href={isCenter ? href : '#/'}
                {...(isCenter ? linkProps(href) : {})}
                aria-label={isCenter ? `افتح ${it.title}` : `اعرض ${it.title}`}
                aria-hidden={!clickable}
                tabIndex={clickable ? 0 : -1}
                draggable={false}
                className="sm-icon"
                onClick={(e) => {
                  if (!isCenter) {
                    e.preventDefault();
                    if (clickable) goTo(i);
                  }
                }}
                style={{ ...itemStyle(role), pointerEvents: clickable ? 'auto' : 'none' }}
              >
                <img
                  src={asset(it.src)}
                  alt=""
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'bottom center',
                  }}
                />
              </a>
            );
          })}
        </div>

        {/* النص والأزرار */}
        <div
          className="absolute bottom-6 start-4 sm:bottom-14 sm:start-24"
          style={{ zIndex: 60, maxWidth: 340 }}
        >
          <div key={activeIndex} className="toonhub-text">
            <p className="sm-bubble">{active.title}</p>
            <p
              className="hidden sm:block text-sm mb-5 font-semibold"
              style={{ color: 'var(--sm-navy)', lineHeight: 1.8 }}
            >
              {active.desc}
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" aria-label="السابق" className="sm-arrow" onClick={() => navigate('prev')}>
              <ArrowRight size={26} strokeWidth={2.75} />
            </button>
            <button type="button" aria-label="التالي" className="sm-arrow" onClick={() => navigate('next')}>
              <ArrowLeft size={26} strokeWidth={2.75} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
