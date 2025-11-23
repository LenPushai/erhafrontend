import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '??',
  title,
  message,
  actionText,
  actionLink,
  onAction,
  className = '',
}) => {
  return (
    <div className={`text-center py-5 ${className}`}>
      <div className="mb-4">
        <span style={{ fontSize: '4rem' }} role="img" aria-label="empty">
          {icon}
        </span>
      </div>
      <h4 className="text-muted mb-3">{title}</h4>
      <p className="text-muted mb-4">{message}</p>
      
      {(actionText && (actionLink || onAction)) && (
        <div>
          {actionLink ? (
            <Link to={actionLink} className="btn btn-primary">
              {actionText}
            </Link>
          ) : (
            <button onClick={onAction} className="btn btn-primary">
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
