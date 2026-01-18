import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import RFQPage from './pages/RFQPage';
import { RFQCreate } from './pages/RFQCreate';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { JobEditPage } from './pages/JobEditPage';
import { ClientsPage } from './pages/ClientsPage';
import SignQuotePage from './pages/SignQuotePage'
import TestQuotePdf from './pages/TestQuotePdf';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with required props */}
      <Sidebar 
        currentPage={location.pathname} 
        onNavigate={handleNavigate} 
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* RFQs */}
          <Route path="/rfqs" element={<RFQPage />} />
          <Route path="/rfqs/new" element={<RFQCreate />} />
          <Route path="/rfqs/:id" element={<RFQPage />} />
          <Route path="/rfqs/:id/edit" element={<RFQPage />} />

          {/* Jobs */}
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/jobs/:id/edit" element={<JobEditPage />} />

          {/* Clients */}
          <Route path="/clients" element={<ClientsPage />} />

          {/* Sign Quote (public page) */}
          <Route path="/test-pdf" element={<TestQuotePdf />} />
        <Route path="/sign/:token" element={<SignQuotePage />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;