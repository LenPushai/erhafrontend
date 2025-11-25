import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Briefcase, 
  FileSpreadsheet, 
  Users, 
  Package, 
  Search,
  Plus,
  FolderOpen
} from 'lucide-react';

interface EmptyStateProps {
  icon?: 'rfq' | 'job' | 'quote' | 'client' | 'inventory' | 'search' | 'folder' | 'custom';
  customIcon?: React.ReactNode;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'folder',
  customIcon,
  title,
  message,
  actionText,
  actionLink,
  onAction,
  className = '',
  size = 'medium'
}) => {
  const getIcon = () => {
    if (customIcon) return customIcon;
    
    const iconSize = size === 'small' ? 48 : size === 'large' ? 80 : 64;
    const iconProps = { size: iconSize, strokeWidth: 1.5 };
    
    switch (icon) {
      case 'rfq': return <FileText {...iconProps} />;
      case 'job': return <Briefcase {...iconProps} />;
      case 'quote': return <FileSpreadsheet {...iconProps} />;
      case 'client': return <Users {...iconProps} />;
      case 'inventory': return <Package {...iconProps} />;
      case 'search': return <Search {...iconProps} />;
      case 'folder': 
      default: return <FolderOpen {...iconProps} />;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return 'py-4';
      case 'large': return 'py-6';
      default: return 'py-5';
    }
  };

  return (
    <div className={`text-center ${getPadding()} ${className}`}>
      <div 
        className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle"
        style={{ 
          width: size === 'small' ? '80px' : size === 'large' ? '140px' : '120px',
          height: size === 'small' ? '80px' : size === 'large' ? '140px' : '120px',
          backgroundColor: '#f8f9fa',
          color: '#6c757d'
        }}
      >
        {getIcon()}
      </div>
      <h4 className="text-muted mb-2" style={{ fontSize: size === 'small' ? '1rem' : '1.25rem' }}>
        {title}
      </h4>
      <p className="text-muted mb-4" style={{ 
        maxWidth: '400px', 
        margin: '0 auto',
        fontSize: size === 'small' ? '0.875rem' : '1rem'
      }}>
        {message}
      </p>
      {(actionText && (actionLink || onAction)) && (
        <div>
          {actionLink ? (
            <Link to={actionLink} className="btn btn-primary">
              <Plus size={18} className="me-2" />
              {actionText}
            </Link>
          ) : (
            <button onClick={onAction} className="btn btn-primary">
              <Plus size={18} className="me-2" />
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;