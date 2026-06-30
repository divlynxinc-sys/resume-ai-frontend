import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { PlanProvider } from '@/contexts/PlanContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <ThemeProvider>
          <AuthProvider>
            <PlanProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </PlanProvider>
          </AuthProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
      <Analytics />
    </>
  </StrictMode>,
)
