import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/common/ToastContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './pages/auth/Login'
import MainLayout from './components/layout/MainLayout'
import AdminDashboard from './components/dashboard/roles/AdminDashboard'
import RFQList from './pages/rfq/RFQList'
import CreateRFQ from './pages/rfq/CreateRFQ'
import CreateQuote from './pages/quotes/CreateQuote'
import QuoteDetail from './pages/quotes/QuoteDetail'
import QuoteEdit from './pages/quotes/QuoteEdit'
import ApproveQuote from './pages/quotes/ApproveQuote'
import RFQDetail from './pages/rfq/RFQDetail'
import RFQEdit from './pages/rfq/RFQEdit'
import QuotesList from './pages/quotes/QuotesList'
import JobsList from './pages/jobs/JobsList'
import JobDetail from './pages/jobs/JobDetail'
import JobEdit from './pages/jobs/JobEdit'
import ClientsList from './pages/clients/ClientsList'
import ClientDetail from './pages/clients/ClientDetail'
import ClientEdit from './pages/clients/ClientEdit'
import CreateClient from './pages/clients/CreateClient'
import InventoryPage from './pages/inventory/InventoryPage'
import ReportsPage from './pages/reports/ReportsPage'
import SettingsPage from './pages/settings/SettingsPage'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public Route - Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes - All wrapped in MainLayout */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            
            {/* RFQ Routes - create before :id */}
            <Route path="rfq" element={<RFQList />} />
            <Route path="rfq/create" element={<CreateRFQ />} />
            <Route path="rfq/:id" element={<RFQDetail />} />
            <Route path="rfq/:id/edit" element={<RFQEdit />} />
            
            {/* Quotes Routes - create before :id */}
            <Route path="quotes" element={<QuotesList />} />
            <Route path="quotes/approve" element={<ApproveQuote />} />
            <Route path="quotes/create" element={<CreateQuote />} />
            <Route path="quotes/:id" element={<QuoteDetail />} />
            <Route path="quotes/:id/edit" element={<QuoteEdit />} />
            
            {/* Jobs Routes */}
            <Route path="jobs" element={<JobsList />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="jobs/:id/edit" element={<JobEdit />} />
            
            {/* Clients Routes - create before :id */}
            <Route path="clients" element={<ClientsList />} />
            <Route path="clients/create" element={<CreateClient />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="clients/:id/edit" element={<ClientEdit />} />
            
            {/* Other Pages */}
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="emergency" element={<div className="text-center p-5"><h3>Emergency Job - Coming Soon</h3></div>} />
            <Route path="docsign" element={<div className="text-center p-5"><h3>DocSign Module - Coming Soon</h3></div>} />
          </Route>
          
          {/* Catch all - redirect to dashboard (will go to login if not authenticated) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App