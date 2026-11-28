import { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import ToonHub from './ToonHub';
import MaterialsPage from './pages/MaterialsPage';
import MajorsPage from './pages/MajorsPage';
import ExamsPage from './pages/ExamsPage';
import UniLinksPage from './pages/UniLinksPage';
import OtherSitesPage from './pages/OtherSitesPage';
import MapPage from './pages/MapPage';
import TeachersPage from './pages/TeachersPage';
import AboutPage from './pages/AboutPage';
import CoursePage from './pages/CoursePage';
import AdminPage from './pages/AdminPage';

// تنقل بسيط بين الصفحات عن طريق الجزء الأخير من الرابط (#/...)
// لإضافة صفحة جديدة: أنشئ ملفها بمجلد pages وأضف سطر هون.
const ROUTES: Record<string, () => JSX.Element> = {
  '#/materials': MaterialsPage,
  '#/majors': MajorsPage,
  '#/exams': ExamsPage,
  '#/uni-links': UniLinksPage,
  '#/other-sites': OtherSitesPage,
  '#/map': MapPage,
  '#/teachers': TeachersPage,
  '#/about': AboutPage,
};

export default function App() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const onChange = () => {
      setRoute(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  // لوحة الأدمن: مخفية (مش مربوطة بأي رابط) وبدون هيدر وفوتر
  if (route === '#/admin') return <AdminPage />;

  const Page = ROUTES[route];
  const courseId = route.startsWith('#/course/') ? decodeURIComponent(route.slice(9)) : null;
  return (
    <>
      <Header route={route} />
      {courseId ? <CoursePage id={courseId} /> : Page ? <Page /> : <ToonHub />}
      <Footer />
    </>
  );
}
