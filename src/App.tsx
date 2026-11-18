import { lazy, Suspense, useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from './state/AppContext'
import Layout from './components/Layout'
import Welcome from './pages/Welcome'
import Home from './pages/Home'

const ImageSource = lazy(() => import('./pages/ImageSource'))
const ImagePreview = lazy(() => import('./pages/ImagePreview'))
const Investigate = lazy(() => import('./pages/Investigate'))
const About = lazy(() => import('./pages/About'))

function NotFound() {
  const { t } = useApp()
  return (
    <Layout title={t('appName')} back="/home">
      <p className="text-lg">{t('notFound')}</p>
      <Link to="/home" className="btn btn-primary mt-4">
        {t('home')}
      </Link>
    </Layout>
  )
}

export default function App() {
  const { t, update } = useApp()
  const loc = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    if (loc.pathname !== '/') update((p) => (p.lastRoute === loc.pathname ? p : { ...p, lastRoute: loc.pathname }))
  }, [loc.pathname, update])
  return (
    <Suspense fallback={<p className="p-6 text-center text-muted">{t('loading')}</p>}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/source" element={<ImageSource />} />
        <Route path="/preview" element={<ImagePreview />} />
        <Route path="/investigate" element={<Investigate />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
