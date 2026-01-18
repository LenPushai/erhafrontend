import jsPDF from 'jspdf';

interface QuoteLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface QuoteData {
  rfqNo: string;
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  clientName: string;
  clientAddress?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  vatAmount: number;
  totalInclVat: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  leadTime?: string;
  specialRequirements?: string;
  quotedBy?: string;
}

export const generateQuotePdf = (data: QuoteData): Blob => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Helper functions
  const centerText = (text: string, yPos: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, yPos);
  };

  const addLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  // ============ HEADER ============
  // Company Logo Area (placeholder)
  doc.setFillColor(30, 58, 95); // Dark blue
  doc.rect(margin, y, pageWidth - (margin * 2), 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ERHA FABRICATION & CONSTRUCTION', margin + 5, y + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Quality Steel Fabrication | Mechanical Services | Maintenance', margin + 5, y + 18);
  
  y += 35;

  // ============ QUOTATION TITLE ============
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  centerText('QUOTATION', y, 24);
  y += 15;

  // Quote details box
  doc.setFillColor(245, 245, 245);
  doc.rect(pageWidth - margin - 70, y - 10, 70, 30, 'F');
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Quote No:', pageWidth - margin - 65, y);
  doc.text('Date:', pageWidth - margin - 65, y + 8);
  doc.text('Valid Until:', pageWidth - margin - 65, y + 16);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(data.quoteNumber || data.rfqNo, pageWidth - margin - 30, y);
  doc.text(data.quoteDate || new Date().toLocaleDateString(), pageWidth - margin - 30, y + 8);
  doc.text(data.validUntil || '30 days', pageWidth - margin - 30, y + 16);

  // Client details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 95);
  doc.text('TO:', margin, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  y += 6;
  doc.text(data.clientName, margin, y);
  y += 5;
  if (data.clientAddress) {
    doc.text(data.clientAddress, margin, y);
    y += 5;
  }
  doc.text(`Attn: ${data.contactPerson}`, margin, y);
  y += 5;
  doc.text(`Email: ${data.contactEmail}`, margin, y);
  y += 5;
  doc.text(`Tel: ${data.contactPhone}`, margin, y);
  
  y += 15;

  // ============ DESCRIPTION ============
  doc.setFillColor(30, 58, 95);
  doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT DESCRIPTION', margin + 3, y + 6);
  y += 12;

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Word wrap description
  const descLines = doc.splitTextToSize(data.description || 'As per your request', pageWidth - (margin * 2) - 10);
  doc.text(descLines, margin, y);
  y += (descLines.length * 5) + 10;

  // ============ LINE ITEMS TABLE ============
  // Table header
  doc.setFillColor(30, 58, 95);
  doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('#', margin + 3, y + 6);
  doc.text('Description', margin + 15, y + 6);
  doc.text('Qty', pageWidth - margin - 75, y + 6);
  doc.text('Unit Price', pageWidth - margin - 55, y + 6);
  doc.text('Total', pageWidth - margin - 25, y + 6);
  y += 10;

  // Table rows
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  if (data.lineItems && data.lineItems.length > 0) {
    data.lineItems.forEach((item, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y - 4, pageWidth - (margin * 2), 8, 'F');
      }
      
      doc.text((index + 1).toString(), margin + 3, y);
      
      // Truncate description if too long
      const desc = item.description.length > 50 ? item.description.substring(0, 47) + '...' : item.description;
      doc.text(desc, margin + 15, y);
      
      doc.text(item.quantity.toString(), pageWidth - margin - 75, y);
      doc.text('R ' + (item.unit_price || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 }), pageWidth - margin - 55, y);
      doc.text('R ' + (item.line_total || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 }), pageWidth - margin - 25, y);
      
      y += 8;
      
      // Check for page break
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    });
  } else {
    // No line items - show description as single item
    doc.text('1', margin + 3, y);
    doc.text(data.description || 'As quoted', margin + 15, y);
    doc.text('1', pageWidth - margin - 75, y);
    doc.text('R ' + data.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 }), pageWidth - margin - 55, y);
    doc.text('R ' + data.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 }), pageWidth - margin - 25, y);
    y += 8;
  }

  y += 5;
  addLine();

  // ============ TOTALS ============
  const totalsX = pageWidth - margin - 80;
  
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal (Excl VAT):', totalsX, y);
  doc.text('R ' + data.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 }), pageWidth - margin - 25, y);
  y += 6;
  
  doc.text('VAT (15%):', totalsX, y);
  doc.text('R ' + data.vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 }), pageWidth - margin - 25, y);
  y += 8;
  
  doc.setFillColor(30, 58, 95);
  doc.rect(totalsX - 5, y - 5, 85, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL (Incl VAT):', totalsX, y + 2);
  doc.text('R ' + data.totalInclVat.toLocaleString('en-ZA', { minimumFractionDigits: 2 }), pageWidth - margin - 25, y + 2);
  
  y += 20;

  // ============ TERMS & CONDITIONS ============
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS & CONDITIONS', margin, y);
  y += 6;

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const terms = [
    `Payment Terms: ${data.paymentTerms || '50% deposit, balance on completion'}`,
    `Delivery: ${data.deliveryTerms || 'Ex Works'}`,
    `Lead Time: ${data.leadTime || 'To be confirmed upon order'}`,
    'Validity: This quote is valid for 30 days from date of issue',
    'All prices are quoted in South African Rand (ZAR)',
  ];
  
  terms.forEach(term => {
    doc.text('• ' + term, margin, y);
    y += 5;
  });

  if (data.specialRequirements) {
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.text('Special Requirements:', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const reqLines = doc.splitTextToSize(data.specialRequirements, pageWidth - (margin * 2) - 10);
    doc.text(reqLines, margin, y);
    y += (reqLines.length * 5);
  }

  y += 15;

  // ============ SIGNATURE SECTION ============
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, margin + 60, y);
  doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);
  
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('For ERHA Fabrication', margin, y);
  doc.text('Client Acceptance', pageWidth - margin - 60, y);
  
  y += 5;
  doc.text(data.quotedBy || 'Authorized Signatory', margin, y);
  doc.text('Signature & Date', pageWidth - margin - 60, y);

  // ============ FOOTER ============
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  centerText('ERHA Fabrication & Construction | Tel: 016 976 2053 | Email: admin@erhafab.co.za', footerY, 8);
  centerText('Physical: 1 Genl Hertzog Street, Sasolburg | VAT: 4123456789', footerY + 4, 8);

  // Return as blob
  return doc.output('blob');
};

export const generateAndUploadQuotePdf = async (
  supabase: any,
  rfqId: string,
  quoteData: QuoteData
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Generate PDF
    const pdfBlob = generateQuotePdf(quoteData);
    
    // Create file name
    const fileName = `${quoteData.quoteNumber || quoteData.rfqNo}_${Date.now()}.pdf`;
    const filePath = `quotes/${fileName}`;
    
    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('quote-pdfs')
      .upload(filePath, pdfBlob, { 
        cacheControl: '3600', 
        upsert: true,
        contentType: 'application/pdf'
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('quote-pdfs')
      .getPublicUrl(filePath);
    
    // Update RFQ with PDF URL
    const { error: updateError } = await supabase
      .from('rfqs')
      .update({ quote_pdf_url: urlData.publicUrl })
      .eq('id', rfqId);
    
    if (updateError) throw updateError;
    
    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
