import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import BackButton from './BackButton';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBreadcrumbs?: boolean;
  showBackButton?: boolean;
  backButtonPath?: string;
  backButtonLabel?: string;
  actions?: React.ReactNode;
  breadcrumbItems?: Array<{ label: string; path?: string }>;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBreadcrumbs = true,
  showBackButton = true,
  backButtonPath,
  backButtonLabel,
  actions,
  breadcrumbItems
}) => {
  return (
    <div className="mb-4">
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <div className="mb-3">
          <Breadcrumbs customItems={breadcrumbItems} />
        </div>
      )}

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          {/* Back Button + Title Row */}
          <div className="d-flex align-items-center gap-3 mb-2">
            {showBackButton && (
              <BackButton 
                to={backButtonPath}
                label={backButtonLabel}
              />
            )}
            <h2 className="mb-0">{title}</h2>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-muted mb-0">{subtitle}</p>
          )}
        </div>

        {/* Action Buttons */}
        {actions && (
          <div className="ms-3">
            {actions}
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="mt-3" />
    </div>
  );
};

export default PageHeader;

