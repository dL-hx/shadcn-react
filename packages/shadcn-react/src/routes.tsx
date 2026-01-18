import { Navigate } from 'react-router-dom'
import Dashboard from './pages/dashboard'
import Lifecycle from './pages/lifecycle'
import Analytics from './pages/analytics'
import Projects from './pages/projects'
import Team from './pages/team'
import Chatbot from './pages/chatbot'

export const routes = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/lifecycle', element: <Lifecycle /> },
  { path: '/analytics', element: <Analytics /> },
  { path: '/projects', element: <Projects /> },
  { path: '/team', element: <Team /> },
  { path: '/chatbot', element: <Chatbot /> },
]