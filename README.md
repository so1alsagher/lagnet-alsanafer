# لجنة السنافر

موقع React + Vite + Tailwind، وينشر تلقائياً على GitHub Pages.

## التطوير محلياً

```bash
npm install
npm run dev
```

## النشر على GitHub Pages

- افتح **Settings → Pages → Build and deployment** واختر **Source: GitHub Actions**.
- كل push على الفرع `main` يشغّل `.github/workflows/static.yml`: يبني المشروع (`npm run build`) وينشر مجلد `dist`.
- الرابط: `https://<username>.github.io/<repo>/`.
- الموقع يستخدم مسارات نسبية وتنقّلاً بالـ hash، لذلك يشتغل تحت اسم المستودع بدون إعداد إضافي.

## التعديل على المحتوى

- الأيقونات والنصوص والروابط: `src/ToonHub.tsx` (المصفوفة `ITEMS`).
- الصور في `public/`. أضف مساراً مثل `/icons/new.png`، وسيُhandle تلقائياً عبر `assetPath`.
- روابط الهيدر: `src/Header.tsx` (المصفوفة `NAV`).
- الصفحات الداخلية: مجلد `src/pages`.
