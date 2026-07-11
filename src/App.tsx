import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { HomePage } from './pages/HomePage'

const BattlePage = lazy(() => import('./pages/BattlePage').then((module) => ({ default: module.BattlePage })))
const DecksPage = lazy(() => import('./pages/DecksPage').then((module) => ({ default: module.DecksPage })))
const GalleryPage = lazy(() => import('./pages/GalleryPage').then((module) => ({ default: module.GalleryPage })))
const PlayPage = lazy(() => import('./pages/PlayPage').then((module) => ({ default: module.PlayPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))

export function App() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--gold)' }}>Abriendo la crónica…</div>}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="play" element={<PlayPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="decks" element={<DecksPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="battle" element={<BattlePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
