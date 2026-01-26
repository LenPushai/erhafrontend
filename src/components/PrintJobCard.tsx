import React, { useEffect, useState } from 'react'
import { X, Printer, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface PrintJobCardProps {
  job: any
  onClose: () => void
}

export const PrintJobCard: React.FC<PrintJobCardProps> = ({ job, onClose }) => {
  const [jobData, setJobData] = useState<any>(null)
  const [lineItems, setLineItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobDetails = async () => {
      // Fetch full job data if needed
      const { data: fullJob } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', job.id)
        .single()

      const { data: items } = await supabase
        .from('job_line_items')
        .select('*')
        .eq('job_id', job.id)
        .order('sort_order')

      setJobData(fullJob || job)
      setLineItems(items || [])
      setLoading(false)
    }

    fetchJobDetails()
  }, [job])

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(generateJobCardHtml(jobData, lineItems))
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 500)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6">Loading...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Print Job Card</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600">Job Number</p>
          <p className="text-2xl font-bold text-blue-600">{jobData?.job_number}</p>
          <p className="text-gray-600 mt-2">{jobData?.client_name}</p>
          <p className="text-sm text-gray-500">{jobData?.description?.substring(0, 100)}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handlePrint} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
            <Printer size={18} /> Print
          </button>
        </div>
      </div>
    </div>
  )
}

function generateJobCardHtml(job: any, lineItems: any[]): string {
  const actionsRequired = job?.actions_required?.split(',') || []
  const attachedDocs = job?.attached_documents?.split(',') || []

  const actionsGrid = [
    ['MANUFACTURE', 'SERVICE', 'REPAIR', 'MODIFY'],
    ['SANDBLAST', 'PAINT', 'INSTALLATION', ''],
    ['PREPARE_MATERIAL', 'OTHER', 'CUT', '']
  ]

  const actionCheckbox = (action: string) => {
    const checked = actionsRequired.includes(action)
    return action ? `<td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 10px;">
      <span style="font-size: 14px;">${checked ? '☑' : '☐'}</span> ${action.replace('_', ' ')}
    </td>` : '<td style="border: 1px solid #000;"></td>'
  }

  const totalQty = lineItems.reduce((sum, li) => sum + (li.quantity || 0), 0)
  const description = lineItems.map(li => li.description).join('; ') || job?.description || ''

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Job Card - ${job?.job_number}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 10px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #000; padding: 4px 6px; }
    .title { font-size: 14px; font-weight: bold; color: #1a365d; text-align: center; }
    .label { font-size: 9px; color: #666; }
    .value { font-weight: bold; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <!-- Header -->
  <table style="margin-bottom: 10px;">
    <tr>
      <td style="width: 40%; padding: 10px;">
        <div style="font-size: 16px; font-weight: bold; color: #1a365d;">ERHA Fabrication & Construction</div>
        <div style="font-size: 10px; color: #666;">(Pty) Ltd</div>
      </td>
      <td style="width: 25%; text-align: center;"><div class="title">QC Department</div></td>
      <td style="width: 35%; padding: 5px; font-size: 10px;">
        <div><strong>Approved date:</strong> 2022/12/06</div>
        <div><strong>Revision:</strong> 1</div>
        <div><strong>Form no:</strong> QCL JC 001</div>
      </td>
    </tr>
  </table>

  <!-- Work Type -->
  <table style="margin-bottom: 10px;">
    <tr>
      <td style="width: 50%; padding: 8px;">
        <span style="font-size: 14px;">${job?.job_type === 'CONTRACT' ? '☑' : '☐'}</span> <strong>Contract Work</strong>
        <div style="font-size: 9px; color: #666;">Panels, Lances, EBT Devices, Taphole Flanges, Ladle</div>
      </td>
      <td style="width: 50%; padding: 8px;">
        <span style="font-size: 14px;">${job?.job_type === 'QUOTED' ? '☑' : '☐'}</span> <strong>Quoted Work</strong>
      </td>
    </tr>
    <tr>
      <td style="padding: 5px;"><span class="label">Compiled by:</span> <span class="value">${job?.compiled_by || ''}</span></td>
      <td style="padding: 5px;"><span class="label">Compiled by:</span> <span class="value">${job?.compiled_by || ''}</span></td>
    </tr>
  </table>

  <!-- Job Info -->
  <table style="margin-bottom: 10px;">
    <tr><td style="padding: 5px;"><span class="label">Employee:</span> <span class="value">${job?.assigned_employee_name || ''}</span></td></tr>
    <tr><td style="padding: 5px;">
      <span class="label">Job Nr:</span> <span class="value">${job?.job_number}</span> &nbsp;&nbsp;&nbsp;
      <span class="label">JOB CARD NO:</span> <span class="value">${job?.job_number}</span> &nbsp;&nbsp;&nbsp;
      <span class="label">RFQ:</span> <span class="value">${job?.rfq_number || ''}</span> &nbsp;&nbsp;&nbsp;
      <span class="label">SITE REQ:</span> <span class="value">${job?.site_req || ''}</span>
    </td></tr>
  </table>

  <!-- Actions Required -->
  <div style="font-weight: bold; margin-bottom: 5px;">ACTIONS REQUIRED</div>
  <table style="margin-bottom: 10px;">
    ${actionsGrid.map(row => `<tr>${row.map(action => actionCheckbox(action)).join('')}</tr>`).join('')}
  </table>

  <!-- Job Description -->
  <table style="margin-bottom: 10px;">
    <tr>
      <td style="padding: 8px; min-height: 60px;">
        <div class="label">JOB DESCRIPTION:</div>
        <div class="value" style="margin-top: 5px;">${description}</div>
      </td>
      <td style="padding: 8px; width: 60px; text-align: center;">
        <div class="label">QTY</div>
        <div class="value">${totalQty || ''}</div>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding: 5px;">
        <span class="label">DRAWING:</span> <span style="font-size: 14px;">${job?.has_drawing ? '☑' : '☐'}</span>
      </td>
    </tr>
  </table>

  <!-- Artisan Notice -->
  <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 8px; margin-bottom: 10px; font-size: 10px;">
    <strong>ARTISAN:</strong> Make sure you signed the Internal Transmittal to acknowledge receipt of your job card!
  </div>

  <!-- Supervisor Planning -->
  <table style="margin-bottom: 10px;">
    <tr style="background: #f3f4f6;"><td colspan="4" style="padding: 5px; font-weight: bold;">SUPERVISOR JOB PLANNING INFO</td></tr>
    <tr>
      <td style="padding: 5px; text-align: center;"><span class="label">Date Received</span></td>
      <td style="padding: 5px; text-align: center;"><span class="label">Material Ordered</span></td>
      <td style="padding: 5px; text-align: center;"><span class="label">Completion Date</span></td>
      <td style="padding: 5px; text-align: center;"><span class="label">DUE DATE</span></td>
    </tr>
    <tr>
      <td style="padding: 8px; text-align: center;">${job?.date_received || ''}</td>
      <td style="padding: 8px; text-align: center;">${job?.material_ordered_date || ''}</td>
      <td style="padding: 8px; text-align: center;">${job?.completion_date || ''}</td>
      <td style="padding: 8px; text-align: center; font-weight: bold;">${job?.due_date || ''}</td>
    </tr>
  </table>

  <!-- Signatures -->
  <table>
    <tr>
      <td style="padding: 10px; width: 50%;"><div class="label">SUPERVISOR SIGNATURE:</div><div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;">${job?.assigned_supervisor_name || ''}</div></td>
      <td style="padding: 10px; width: 50%;"><div class="label">EMPLOYEE SIGNATURE:</div><div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;">${job?.assigned_employee_name || ''}</div></td>
    </tr>
  </table>
</body>
</html>`
}

export default PrintJobCard