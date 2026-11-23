import { useEffect, useState } from 'react';
import Header from './Header';
import ToonHub from './ToonHub';
import MaterialsPage from './pages/MaterialsPage';
import MajorsPage from './pages/MajorsPage';
import MapPage from './pages/MapPage';
import TeachersPage from './pages/TeachersPage';
import AboutPage from './pages/AboutPage';

// تنقل بسيط بين الصفحات عن طريق الجزء الأخير من الرابط (#/...)
// لإضافة صفحة جديدة: أنشئ ملفها بمجلد pages وأضف سطر هون.
const ROUTES: Record<string, () => JSX.Element> = {
  '#/materials': MaterialsPage,
  '#/majors': MajorsPage,
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

  const Page = ROUTES[route];
  return (
    <>
      <Header route={route} />
      {Page ? <Page /> : <ToonHub />}
    </>
  );
}
