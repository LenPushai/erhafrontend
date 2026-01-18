import React, { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';

const TestQuotePdf: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    generateTestPdf();
  }, []);

  const generateTestPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // ============ HEADER ============
    doc.setFillColor(30, 58, 95);
    doc.rect(margin, y, pageWidth - (margin * 2), 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ERHA FABRICATION & CONSTRUCTION', margin + 5, y + 10);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Quality Steel Fabrication | Mechanical Services | Plant Maintenance', margin + 5, y + 18);
    
    y += 35;

    // ============ QUOTATION TITLE ============
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTATION', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Quote details box
    doc.setFillColor(245, 245, 245);
    doc.rect(pageWidth - margin - 70, y - 10, 70, 35, 'F');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Quote No:', pageWidth - margin - 65, y);
    doc.text('RFQ Ref:', pageWidth - margin - 65, y + 8);
    doc.text('Date:', pageWidth - margin - 65, y + 16);
    doc.text('Valid Until:', pageWidth - margin - 65, y + 24);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('PQ-2026-0001', pageWidth - margin - 25, y);
    doc.text('RFQ-2026-0005', pageWidth - margin - 25, y + 8);
    doc.text('18 Jan 2026', pageWidth - margin - 25, y + 16);
    doc.text('17 Feb 2026', pageWidth - margin - 25, y + 24);

    // Client details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 95);
    doc.text('TO:', margin, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    y += 6;
    doc.text('COLUMBUS STAINLESS (PTY) LTD', margin, y);
    y += 5;
    doc.text('Middelburg, Mpumalanga', margin, y);
    y += 5;
    doc.text('Attn: Hendrik vd Westhuizen', margin, y);
    y += 5;
    doc.text('Email: lenklopper03@gmail.com', margin, y);
    y += 5;
    doc.text('Tel: 065 125 4475', margin, y);
    
    y += 20;

    // ============ DESCRIPTION ============
    doc.setFillColor(30, 58, 95);
    doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PROJECT DESCRIPTION', margin + 3, y + 6);
    y += 14;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Supply and installation of stainless steel handrails and platforms', margin, y);
    y += 5;
    doc.text('for the new processing plant expansion project - Phase 2.', margin, y);
    y += 15;

    // ============ LINE ITEMS TABLE ============
    doc.setFillColor(30, 58, 95);
    doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('#', margin + 3, y + 6);
    doc.text('Description', margin + 12, y + 6);
    doc.text('Qty', pageWidth - margin - 70, y + 6);
    doc.text('Unit Price', pageWidth - margin - 50, y + 6);
    doc.text('Total', pageWidth - margin - 20, y + 6);
    y += 12;

    // Line items
    const items = [
      { desc: 'SS316 Handrail - 50mm dia, polished finish', qty: 45, unit: 850, total: 38250 },
      { desc: 'Platform grating - 1200x2400mm panels', qty: 12, unit: 3500, total: 42000 },
      { desc: 'Support brackets - heavy duty', qty: 36, unit: 450, total: 16200 },
      { desc: 'Installation labor (2 teams x 5 days)', qty: 10, unit: 2800, total: 28000 },
      { desc: 'Transport and crane hire', qty: 1, unit: 8500, total: 8500 },
    ];

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    items.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y - 4, pageWidth - (margin * 2), 8, 'F');
      }
      
      doc.text((index + 1).toString(), margin + 3, y);
      doc.text(item.desc, margin + 12, y);
      doc.text(item.qty.toString(), pageWidth - margin - 70, y);
      doc.text('R ' + item.unit.toLocaleString(), pageWidth - margin - 50, y);
      doc.text('R ' + item.total.toLocaleString(), pageWidth - margin - 20, y);
      y += 8;
    });

    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // ============ TOTALS ============
    const totalsX = pageWidth - margin - 80;
    const subtotal = 132950;
    const vat = subtotal * 0.15;
    const total = subtotal + vat;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal (Excl VAT):', totalsX, y);
    doc.text('R ' + subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 }), pageWidth - margin - 20, y);
    y += 6;
    
    doc.text('VAT (15%):', totalsX, y);
    doc.text('R ' + vat.toLocaleString('en-ZA', { minimumFractionDigits: 2 }), pageWidth - margin - 20, y);
    y += 10;
    
    doc.setFillColor(30, 58, 95);
    doc.rect(totalsX - 5, y - 5, 90, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL (Incl VAT):', totalsX, y + 3);
    doc.text('R ' + total.toLocaleString('en-ZA', { minimumFractionDigits: 2 }), pageWidth - margin - 20, y + 3);
    
    y += 25;

    // ============ TERMS & CONDITIONS ============
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS', margin, y);
    y += 7;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const terms = [
      'Payment Terms: 50% deposit on order, balance on completion',
      'Delivery: Ex Works, Sasolburg',
      'Lead Time: 3-4 weeks from receipt of deposit',
      'Validity: This quotation is valid for 30 days from date of issue',
      'All prices quoted in South African Rand (ZAR)',
      'E&OE - Errors and Omissions Excepted',
    ];
    
    terms.forEach(term => {
      doc.text('• ' + term, margin, y);
      y += 5;
    });

    y += 15;

    // ============ SIGNATURE SECTION ============
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text('ACCEPTANCE', margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text('By signing below, you accept this quotation and authorize ERHA Fabrication to proceed with the work.', margin, y);
    y += 15;

    // Signature lines
    doc.setDrawColor(150, 150, 150);
    
    // ERHA signature
    doc.text('For ERHA Fabrication & Construction:', margin, y);
    y += 12;
    doc.line(margin, y, margin + 60, y);
    y += 5;
    doc.setFontSize(8);
    doc.text('Authorized Signature', margin, y);
    doc.text('Date: _______________', margin + 70, y - 5);
    
    y += 15;
    
    // Client signature
    doc.setFontSize(9);
    doc.text('For COLUMBUS STAINLESS (PTY) LTD:', margin, y);
    y += 12;
    doc.line(margin, y, margin + 60, y);
    y += 5;
    doc.setFontSize(8);
    doc.text('Authorized Signature', margin, y);
    doc.text('Date: _______________', margin + 70, y - 5);
    doc.text('Name: _______________', margin + 120, y - 5);

    // ============ FOOTER ============
    const footerY = doc.internal.pageSize.getHeight() - 12;
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('ERHA Fabrication & Construction (Pty) Ltd | Reg: 2015/123456/07 | VAT: 4850123456', pageWidth / 2, footerY, { align: 'center' });
    doc.text('1 Genl Hertzog Street, Sasolburg, 1947 | Tel: 016 976 2053 | Email: quotes@erhafab.co.za', pageWidth / 2, footerY + 4, { align: 'center' });

    // Display in iframe
    const pdfDataUri = doc.output('datauristring');
    if (iframeRef.current) {
      iframeRef.current.src = pdfDataUri;
    }

    // Also trigger download
    doc.save('ERHA_Quote_PQ-2026-0001_TEST.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-900 text-white p-6">
            <h1 className="text-2xl font-bold">Test Quote PDF Generated!</h1>
            <p className="opacity-80">The PDF has been downloaded to your computer</p>
          </div>
          
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">? PDF Downloaded!</p>
              <p className="text-green-600 text-sm">Check your Downloads folder for: ERHA_Quote_PQ-2026-0001_TEST.pdf</p>
            </div>

            <h2 className="text-lg font-bold mb-4">PDF Preview:</h2>
            <iframe 
              ref={iframeRef}
              className="w-full h-[600px] border rounded-lg"
              title="Quote PDF Preview"
            />
            
            <div className="mt-6 flex gap-4">
              <button 
                onClick={generateTestPdf}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download Again
              </button>
              <a 
                href="/rfqs" 
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Back to RFQs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestQuotePdf;
