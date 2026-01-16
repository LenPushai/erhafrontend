import { useState } from 'react'
import { 
  LayoutDashboard, Users, FileText, ClipboardList, Briefcase,
  Settings, Menu, ChevronLeft, LayoutGrid, Clock, UserCheck,
  Package, BarChart3, AlertCircle
} from 'lucide-react'

const operationsNav = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'RFQs', href: '/rfqs', icon: FileText },
  { name: 'Quoter Dashboard', href: '/quoter', icon: ClipboardList },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
]

const workshopNav = [
  { name: 'Kanban Board', href: '/kanban', icon: LayoutGrid },
  { name: 'Time Tracking', href: '/time', icon: Clock },
  { name: 'Casual Labor', href: '/labor', icon: UserCheck },
]

const adminNav = [
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Clients', href: '/clients', icon: Users },
]

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const sidebarWidth = collapsed ? 'w-16' : 'w-56'

  const NavItem = ({ item }: { item: { name: string; href: string; icon: any } }) => {
    const isActive = currentPage === item.href
    const btnClass = isActive 
      ? 'bg-blue-600 text-white' 
      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    return (
      <button
        onClick={() => onNavigate(item.href)}
        className={'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ' + btnClass}
      >
        <item.icon size={18} />
        {!collapsed && <span>{item.name}</span>}
      </button>
    )
  }

  const SectionLabel = ({ label }: { label: string }) => (
    !collapsed ? (
      <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
    ) : null
  )

  return (
    <aside className={'flex flex-col bg-gray-900 h-full flex-shrink-0 transition-all duration-300 ' + sidebarWidth}>
      <div className="flex items-center justify-between h-14 px-3 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">E</div>
            <div>
              <p className="text-sm font-semibold text-white">ERHA OPS</p>
              <p className="text-xs text-gray-500">Operations Portal</p>
            </div>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
        >
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-1">
        <SectionLabel label="Operations" />
        {operationsNav.map((item) => <NavItem key={item.name} item={item} />)}
        
        <div className="pt-4">
          <SectionLabel label="Workshop" />
          {workshopNav.map((item) => <NavItem key={item.name} item={item} />)}
        </div>

        <div className="pt-4">
          <SectionLabel label="Admin" />
          {adminNav.map((item) => <NavItem key={item.name} item={item} />)}
        </div>
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
          <AlertCircle size={16} />
          {!collapsed && <span>Emergency Job</span>}
        </button>
      </div>
    </aside>
  )
}
