import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Job {
  id: string
  job_number: string
  job_card_no: string | null
  client_name: string | null
  contact_person: string | null
  contact_phone: string | null
  description: string | null
  site_location: string | null
  site_req: string | null
  is_contract_work: boolean
  is_quoted_work: boolean
  compiled_by: string | null
  rfq_number: string | null
  // Actions
  action_manufacture: boolean
  action_sandblast: boolean
  action_prepare_material: boolean
  action_service: boolean
  action_paint: boolean
  action_other: boolean
  action_other_description: string | null
  action_repair: boolean
  action_installation: boolean
  action_cut: boolean
  action_modify: boolean
  // Documents
  has_service_schedule: boolean
  has_drawing: boolean
  has_internal_order: boolean
  has_info_for_quote: boolean
  has_qcp: boolean
  has_list_as_quoted: boolean
  // Planning
  date_received: string | null
  material_ordered_date: string | null
  completion_date: string | null
  due_date: string | null
  supervisor_signature: string | null
  employee_signature: string | null
  assigned_supervisor: string | null
  status: string
  priority: string
  quoted_value: number | null
}

interface LineItem {
  item_type: string
  description: string
  quantity: number
  uom: string
  sell_price: number
  line_total: number
}

interface HoldingPoint {
  point_number: number
  description: string
  is_applicable: boolean
  is_passed: boolean | null
  signed_by: string | null
}

interface TimeEntry {
  employee_name: string
  week_start_date: string
  description: string
  mon_nt: number; mon_ot: number
  tue_nt: number; tue_ot: number
  wed_nt: number; wed_ot: number
  thu_nt: number; thu_ot: number
  fri_nt: number; fri_ot: number
  sat_nt: number; sat_ot: number
  sun_nt: number; sun_ot: number
  total_nt: number
  total_ot: number
}

export const generateJobCardPDF = (
  job: Job,
  lineItems: LineItem[],
  holdingPoints: HoldingPoint[],
  timeEntries: TimeEntry[]
): void => {
  const doc = new jsPDF('portrait', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10
  let y = margin

  // Colors
  const headerBg: [number, number, number] = [41, 128, 185]
  const lightGray: [number, number, number] = [245, 245, 245]
  const darkGray: [number, number, number] = [100, 100, 100]

  // ============================================
  // HEADER
  // ============================================
  doc.setFillColor(...headerBg)
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ERHA FABRICATION & CONSTRUCTION', margin + 5, y + 8)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('QC Department', margin + 5, y + 14)
  
  // Form info on right
  doc.setFontSize(8)
  doc.text('Form No: QCL JC 001', pageWidth - margin - 40, y + 8)
  doc.text(`Revision: 1`, pageWidth - margin - 40, y + 12)
  doc.text(`Printed: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, y + 16)
  
  y += 25

  // ============================================
  // JOB IDENTIFICATION
  // ============================================
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('JOB IDENTIFICATION', margin, y)
  y += 6

  // Job info table
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [],
    body: [
      ['Job Number:', job.job_number || '-', 'Job Card No:', job.job_card_no || '-'],
      ['RFQ:', job.rfq_number || '-', 'Site Req:', job.site_req || '-'],
      ['Client:', job.client_name || '-', 'Contact:', job.contact_person || '-'],
      ['Phone:', job.contact_phone || '-', 'Site Location:', job.site_location || '-'],
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 25 },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', cellWidth: 25 },
      3: { cellWidth: 55 },
    },
  })
  
  y = (doc as any).lastAutoTable.finalY + 5

  // Work Type
  const workType = []
  if (job.is_contract_work) workType.push('CONTRACT WORK')
  if (job.is_quoted_work) workType.push('QUOTED WORK')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Work Type: ${workType.join(' | ') || '-'}`, margin, y)
  doc.text(`Compiled By: ${job.compiled_by || '-'}`, pageWidth / 2, y)
  y += 8

  // ============================================
  // ACTIONS REQUIRED
  // ============================================
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('ACTIONS REQUIRED', margin, y)
  y += 5

  const actions = [
    { label: 'MANUFACTURE', checked: job.action_manufacture },
    { label: 'SANDBLAST', checked: job.action_sandblast },
    { label: 'PREPARE MATERIAL', checked: job.action_prepare_material },
    { label: 'SERVICE', checked: job.action_service },
    { label: 'PAINT', checked: job.action_paint },
    { label: 'REPAIR', checked: job.action_repair },
    { label: 'INSTALLATION', checked: job.action_installation },
    { label: 'CUT', checked: job.action_cut },
    { label: 'MODIFY', checked: job.action_modify },
    { label: 'OTHER', checked: job.action_other },
  ]

  const actionRows = []
  for (let i = 0; i < actions.length; i += 5) {
    actionRows.push(actions.slice(i, i + 5).map(a => `${a.checked ? '☑' : '☐'} ${a.label}`))
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [],
    body: actionRows,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1 },
  })

  y = (doc as any).lastAutoTable.finalY + 3

  if (job.action_other && job.action_other_description) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text(`Other: ${job.action_other_description}`, margin, y)
    y += 5
  }

  // ============================================
  // JOB DESCRIPTION
  // ============================================
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('JOB DESCRIPTION', margin, y)
  y += 5

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const descLines = doc.splitTextToSize(job.description || 'No description provided', pageWidth - 2 * margin - 10)
  doc.text(descLines, margin, y)
  y += descLines.length * 4 + 5

  // ============================================
  // ATTACHED DOCUMENTS
  // ============================================
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('ATTACHED DOCUMENTS:', margin, y)
  y += 5

  const docs = [
    { label: 'Service Schedule/QCP', checked: job.has_service_schedule },
    { label: 'Drawing/Sketches', checked: job.has_drawing },
    { label: 'Internal Order', checked: job.has_internal_order },
    { label: 'Info for Quote', checked: job.has_info_for_quote },
    { label: 'QCP', checked: job.has_qcp },
    { label: 'List as Quoted', checked: job.has_list_as_quoted },
  ]

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const docText = docs.map(d => `${d.checked ? '☑' : '☐'} ${d.label}`).join('   ')
  doc.text(docText, margin, y)
  y += 8

  // ============================================
  // SUPERVISOR JOB PLANNING
  // ============================================
  doc.setFillColor(...lightGray)
  doc.rect(margin, y - 2, pageWidth - 2 * margin, 25, 'F')
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('SUPERVISOR JOB PLANNING', margin + 2, y + 3)
  y += 7

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Date Received', 'Material Ordered', 'Completion Date', 'DUE DATE']],
    body: [[
      job.date_received || '___________',
      job.material_ordered_date || '___________',
      job.completion_date || '___________',
      job.due_date || '___________',
    ]],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: headerBg, fontSize: 8 },
  })

  y = (doc as any).lastAutoTable.finalY + 5

  // Signatures
  doc.setFontSize(9)
  doc.text(`Supervisor Signature: ${job.supervisor_signature || '_______________________'}`, margin, y)
  doc.text(`Employee Signature: ${job.employee_signature || '_______________________'}`, pageWidth / 2, y)
  y += 10

  // ============================================
  // LINE ITEMS (if any)
  // ============================================
  if (lineItems.length > 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('LINE ITEMS', margin, y)
    y += 5

    const itemRows = lineItems.map((item, i) => [
      (i + 1).toString(),
      item.item_type,
      item.description || '-',
      item.quantity.toString(),
      item.uom,
      `R ${item.sell_price.toLocaleString()}`,
      `R ${item.line_total.toLocaleString()}`,
    ])

    const totalValue = lineItems.reduce((sum, item) => sum + item.line_total, 0)
    itemRows.push(['', '', '', '', '', 'TOTAL:', `R ${totalValue.toLocaleString()}`])

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['#', 'Type', 'Description', 'Qty', 'UOM', 'Price', 'Total']],
      body: itemRows,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: headerBg },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 20 },
        2: { cellWidth: 60 },
        5: { halign: 'right' },
        6: { halign: 'right', fontStyle: 'bold' },
      },
    })

    y = (doc as any).lastAutoTable.finalY + 8
  }

  // ============================================
  // NEW PAGE FOR TIME TRACKING & HOLDING POINTS
  // ============================================
  doc.addPage()
  y = margin

  // Header on page 2
  doc.setFillColor(...headerBg)
  doc.rect(margin, y, pageWidth - 2 * margin, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`JOB CARD: ${job.job_number} - Page 2`, margin + 5, y + 8)
  y += 18

  // ============================================
  // TIME TRACKING
  // ============================================
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TIME TRACKING', margin, y)
  y += 5

  if (timeEntries.length > 0) {
    timeEntries.forEach((entry, idx) => {
      if (idx > 0) y += 3
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(`Week: ${entry.week_start_date} | Employee: ${entry.employee_name || '-'} | ${entry.description || '-'}`, margin, y)
      y += 4

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Total']],
        body: [
          ['NT', entry.mon_nt, entry.tue_nt, entry.wed_nt, entry.thu_nt, entry.fri_nt, entry.sat_nt, entry.sun_nt, entry.total_nt],
          ['OT', entry.mon_ot, entry.tue_ot, entry.wed_ot, entry.thu_ot, entry.fri_ot, entry.sat_ot, entry.sun_ot, entry.total_ot],
        ],
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1, halign: 'center' },
        headStyles: { fillColor: headerBg },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 10 } },
      })

      y = (doc as any).lastAutoTable.finalY + 3
    })
  } else {
    // Empty time grid
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Date', 'Description', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Total']],
      body: [
        ['', '', 'NT|OT', 'NT|OT', 'NT|OT', 'NT|OT', 'NT|OT', 'OT', 'OT', 'NT|OT'],
        ['', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ''],
      ],
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: headerBg },
    })
    y = (doc as any).lastAutoTable.finalY + 5
  }

  y += 5

  // ============================================
  // HOLDING POINTS
  // ============================================
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('HOLDING POINTS', margin, y)
  y += 5

  const hpRows = holdingPoints.map(hp => [
    hp.point_number.toString(),
    hp.description,
    hp.is_applicable ? (hp.is_passed === true ? 'PASS' : hp.is_passed === false ? 'FAIL' : '-') : 'N/A',
    hp.is_applicable ? 'Yes' : 'No',
    hp.signed_by || '___________',
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['No', 'Description', 'Pass/Fail', 'Applicable', 'QC/Supervisor Sign']],
    body: hpRows,
    theme: 'striped',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: headerBg },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 80 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 35 },
    },
  })

  y = (doc as any).lastAutoTable.finalY + 5

  // ============================================
  // IMPORTANT NOTES
  // ============================================
  doc.setFillColor(255, 255, 200)
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(150, 100, 0)
  doc.text('IMPORTANT NOTES:', margin + 2, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.text('• Final Inspection must ALWAYS be at least 2 days before delivery date!', margin + 2, y + 10)
  doc.text('• ALL WELDING RODS MUST BE BAKED PRIOR TO WELDING!', margin + 2, y + 14)
  doc.text('• Under no circumstances should work continue to next holding point if previous is not signed.', margin + 2, y + 18)

  // ============================================
  // FOOTER
  // ============================================
  doc.setTextColor(...darkGray)
  doc.setFontSize(7)
  doc.text(`ERHA Operations Management System | Generated: ${new Date().toLocaleString()} | Form QCL JC 001`, margin, pageHeight - 5)

  // Save
  doc.save(`JobCard_${job.job_number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)
}

export default { generateJobCardPDF }