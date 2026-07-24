import { Routes, Route } from 'react-router'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import ProductsPage from './pages/dashboard/ProductsPage'
import ConversationsPage from './pages/dashboard/ConversationsPage'
import FAQsPage from './pages/dashboard/FAQsPage'
import AITestPage from './pages/dashboard/AITestPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="faqs" element={<FAQsPage />} />
        <Route path="ai-test" element={<AITestPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
