import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { pastelExportService } from '../../services/pastelExportService';

interface RfqPastelExportButtonProps {
  rfqId?: number;
  rfqIds?: number[];
  exportType?: 'single' | 'bulk' | 'approved' | 'status';
  status?: string;
  variant?: 'primary' | 'secondary' | 'icon';
  label?: string;
}

export const RfqPastelExportButton: React.FC<RfqPastelExportButtonProps> = ({
  rfqId,
  rfqIds,
  exportType = 'single',
  status,
  variant = 'primary',
  label
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportSuccess(false);

      let csvData: string;

      switch (exportType) {
        case 'single':
          if (!rfqId) throw new Error('RFQ ID required for single export');
          csvData = await pastelExportService.exportRfq(rfqId);
          break;

        case 'bulk':
          if (!rfqIds || rfqIds.length === 0) {
            throw new Error('RFQ IDs required for bulk export');
          }
          csvData = await pastelExportService.exportRfqsBulk(rfqIds);
          break;

        case 'approved':
          csvData = await pastelExportService.exportApprovedRfqs();
          break;

        case 'status':
          if (!status) throw new Error('Status required for status export');
          csvData = await pastelExportService.exportRfqsByStatus(status);
          break;

        default:
          throw new Error('Invalid export type');
      }

      // Trigger download
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PASTEL_RFQ_${exportType}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export RFQ data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
        title="Export to Pastel"
      >
        {exportSuccess ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <FileSpreadsheet className="h-5 w-5" />
        )}
      </button>
    );
  }

  const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = variant === 'primary'
    ? "bg-blue-600 text-white hover:bg-blue-700"
    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50";

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`${baseClasses} ${variantClasses}`}
    >
      {exportSuccess ? (
        <>
          <CheckCircle className="h-5 w-5" />
          <span>Exported!</span>
        </>
      ) : isExporting ? (
        <>
          <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <Download className="h-5 w-5" />
          <span>{label || 'Export to Pastel'}</span>
        </>
      )}
    </button>
  );
};