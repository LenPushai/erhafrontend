import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbsProps {
  customItems?: Array<{ label: string; path?: string }>;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customItems }) => {
  const location = useLocation();

  const generateBreadcrumbs = () => {
    if (customItems) {
      return customItems;
    }

    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Capitalize and format path segment
      let label = path.charAt(0).toUpperCase() + path.slice(1);
      
      // Special formatting for common routes
      if (label === 'Rfqs') label = 'RFQs';
      if (label === 'Edit') label = 'Edit';
      if (label === 'New') label = 'New';
      
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

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb mb-0">
        {items.map((item, index) => (
          <li
            key={index}
            className={`breadcrumb-item ${!item.path ? 'active' : ''}`}
            aria-current={!item.path ? 'page' : undefined}
          >
            {item.path ? (
              <Link to={item.path} className="text-decoration-none">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

