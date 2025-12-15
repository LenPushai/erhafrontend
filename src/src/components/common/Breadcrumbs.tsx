import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
  showHome?: boolean;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customItems, showHome = true }) => {
  const location = useLocation();

  const routeLabels: Record<string, string> = {
    'rfq': 'RFQs',
    'rfqs': 'RFQs',
    'quotes': 'Quotes',
    'jobs': 'Jobs',
    'clients': 'Clients',
    'inventory': 'Inventory',
    'reports': 'Reports',
    'settings': 'Settings',
    'create': 'Create New',
    'edit': 'Edit',
    'new': 'New',
    'dashboard': 'Dashboard',
    'emergency': 'Emergency'
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) {
      return showHome ? [{ label: 'Home', path: '/dashboard' }, ...customItems] : customItems;
    }

    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = showHome ? [{ label: 'Home', path: '/dashboard' }] : [];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Check if it's a number (ID)
      const isId = /^\d+$/.test(path);
      
      // Get label from routeLabels or format it
      let label = routeLabels[path.toLowerCase()] || 
                  (isId ? `#${path}` : path.charAt(0).toUpperCase() + path.slice(1));

      // Don't link the last item (current page)
      const isLast = index === paths.length - 1;
      
      breadcrumbs.push({
        label,
        path: isLast ? undefined : currentPath
      });
    });

    return breadcrumbs;
  };

  const items = generateBreadcrumbs();

  if (items.length <= 1) return null;

  return (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb mb-0 py-2 px-3 bg-light rounded" style={{ fontSize: '0.9rem' }}>
        {items.map((item, index) => (
          <li
            key={index}
            className={`breadcrumb-item d-flex align-items-center ${!item.path ? 'active' : ''}`}
            aria-current={!item.path ? 'page' : undefined}
          >
            {index === 0 && showHome && (
              <Home size={14} className="me-1" style={{ marginTop: '-2px' }} />
            )}
            {item.path ? (
              <Link to={item.path} className="text-decoration-none text-primary">
                {item.label}
              </Link>
            ) : (
              <span className="text-muted fw-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
      <style>{`
        .breadcrumb-item + .breadcrumb-item::before {
          content: none !important;
        }
        .breadcrumb-item:not(:last-child)::after {
          content: '';
          display: inline-block;
          width: 16px;
          height: 16px;
          margin-left: 8px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9 18 15 12 9 6'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
          vertical-align: middle;
        }
      `}</style>
    </nav>
  );
};

export default Breadcrumbs;