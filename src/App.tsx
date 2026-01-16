import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { ClientsPage } from './pages/ClientsPage'
import RFQPage from './pages/RFQPage'
import { Menu, ChevronDown } from 'lucide-react'
import SignQuotePage from './pages/SignQuotePage'

function App() {
  const [currentPage, setCurrentPage] = useState('/')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [signToken, setSignToken] = useState<string | null>(null)

  
  // Check if URL is a signing link (for clients)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/sign/')) {
      setSignToken(path.replace('/sign/', ''));
    }
  }, []);

  // If signing link, show only the signing page
  if (signToken) {
    return <SignQuotePage token={signToken} />;
  }

  const titles: Record<string, string> = { '/': 'Dashboard', '/rfqs': 'RFQs', '/clients': 'Clients', '/jobs': 'Jobs', '/quoter': 'Quoter Dashboard', '/kanban': 'Kanban Board', '/time': 'Time Tracking', '/labor': 'Casual Labor', '/inventory': 'Inventory', '/reports': 'Reports', '/settings': 'Settings' }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {sidebarOpen && <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu size={20} className="text-gray-600" /></button>
            <h1 className="text-lg font-semibold text-gray-900">{titles[currentPage] || 'Dashboard'}</h1>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-sm">A</div>
            <div className="text-left"><p className="text-sm font-medium text-gray-900">admin</p><p className="text-xs text-gray-500">USER</p></div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          {currentPage === '/' && <Dashboard />}
          {currentPage === '/clients' && <ClientsPage />}
          {currentPage === '/rfqs' && <RFQPage />}
          {currentPage !== '/' && currentPage !== '/clients' && currentPage !== '/rfqs' && (
            <div className="p-6"><h1 className="text-2xl font-bold text-gray-900">{titles[currentPage]}</h1><p className="text-gray-500 mt-2">Coming soon...</p></div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App

