import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { AppErrorBoundary } from './components/AppErrorBoundary'

const App = lazy(() => import('./App.tsx'))

const root = document.getElementById('root')

if (!root) {
  throw new Error('No se encontró el elemento #root.')
}

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-600">Cargando MateCode...</p></div>}>
        <App />
      </Suspense>
    </AppErrorBoundary>
  </StrictMode>,
)
