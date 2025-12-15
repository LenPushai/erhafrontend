import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
  fullPage = false,
  className = '',
}) => {
  // Size classes for spinner
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg',
  };

  // Container styling
  const containerClass = fullPage
    ? 'container-fluid py-4'
    : '';

  const contentClass = fullPage
    ? 'd-flex flex-column justify-content-center align-items-center'
    : 'text-center';

  const minHeightStyle = fullPage ? { minHeight: '400px' } : {};

  return (
    <div className={`${containerClass} ${className}`}>
      <div className={contentClass} style={minHeightStyle}>
        <div
          className={`spinner-border text-primary ${sizeClasses[size]}`}
          role="status"
        >
          <span className="visually-hidden">{message}</span>
        </div>
        {message && (
          <p className="mt-2 text-muted mb-0">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
