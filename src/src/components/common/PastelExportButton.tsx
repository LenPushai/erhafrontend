// ============================================================
// ERHA OPS - Pastel Export Button Component
// Reusable button for Sage Pastel CSV exports
// ============================================================

import React, { useState } from 'react';
import { pastelExportService } from '../../services/pastelExportService';

type ExportType = 
  | 'allClients' 
  | 'singleClient' 
  | 'singleQuote' 
  | 'approvedQuotes' 
  | 'bulkQuotes';

interface PastelExportButtonProps {
  exportType: ExportType;
  id?: number;
  ids?: number[];
  buttonText?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
}

export const PastelExportButton: React.FC<PastelExportButtonProps> = ({
  exportType,
  id,
  ids,
  buttonText,
  className = '',
  variant = 'success',
  size = 'md',
  icon = true
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDefaultText = (): string => {
    switch (exportType) {
      case 'allClients': return 'Export Clients to Pastel';
      case 'singleClient': return 'Export to Pastel';
      case 'singleQuote': return 'Export to Pastel';
      case 'approvedQuotes': return 'Export Approved Quotes';
      case 'bulkQuotes': return 'Export Selected to Pastel';
      default: return 'Export to Pastel';
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      switch (exportType) {
        case 'allClients':
          await pastelExportService.exportAllClients();
          break;
        case 'singleClient':
          if (!id) throw new Error('Client ID required');
          await pastelExportService.exportClient(id);
          break;
        case 'singleQuote':
          if (!id) throw new Error('Quote ID required');
          await pastelExportService.exportQuote(id);
          break;
        case 'approvedQuotes':
          await pastelExportService.exportApprovedQuotes();
          break;
        case 'bulkQuotes':
          if (!ids || ids.length === 0) throw new Error('Quote IDs required');
          await pastelExportService.exportQuotesBulk(ids);
          break;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Export failed');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getButtonClasses = (): string => {
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
    const variantClass = variant === 'outline' ? 'btn-outline-success' : `btn-${variant}`;
    return `btn ${variantClass} ${sizeClass} ${className}`.trim();
  };

  const displayText = buttonText || getDefaultText();

  return (
    <button
      className={getButtonClasses()}
      onClick={handleExport}
      disabled={loading}
      title="Export to Sage Pastel CSV format"
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Exporting...
        </>
      ) : success ? (
        <>
          {icon && <i className="bi bi-check-circle me-2"></i>}
          Downloaded!
        </>
      ) : error ? (
        <>
          {icon && <i className="bi bi-exclamation-triangle me-2"></i>}
          {error}
        </>
      ) : (
        <>
          {icon && <i className="bi bi-file-earmark-spreadsheet me-2"></i>}
          {displayText}
        </>
      )}
    </button>
  );
};

export default PastelExportButton;