package com.erha.ops.service;

import com.erha.ops.entity.Quote;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGenerationService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final BaseColor ERHA_DARK_BLUE = new BaseColor(25, 55, 109);
    private static final BaseColor ERHA_LIGHT_GRAY = new BaseColor(245, 245, 245);
    
    public byte[] generateQuotePdf(Quote quote) throws DocumentException, IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 50, 50);
        PdfWriter.getInstance(document, out);
        document.open();
        
        addHeader(document, quote);
        addQuoteDetails(document, quote);
        addAmountSection(document, quote);
        addTermsAndConditions(document, quote);
        addFooter(document, quote);
        
        document.close();
        return out.toByteArray();
    }
    
    private void addHeader(Document document, Quote quote) throws DocumentException {
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, ERHA_DARK_BLUE);
        Paragraph header = new Paragraph("ERHA FABRICATION & CONSTRUCTION", headerFont);
        header.setAlignment(Element.ALIGN_CENTER);
        header.setSpacingAfter(5);
        document.add(header);
        
        Font subFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.DARK_GRAY);
        Paragraph tagline = new Paragraph("Engineering Excellence | Quality Workmanship", subFont);
        tagline.setAlignment(Element.ALIGN_CENTER);
        tagline.setSpacingAfter(20);
        document.add(tagline);
        
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
        Paragraph title = new Paragraph("QUOTATION", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(30);
        document.add(title);
    }
    
    private void addQuoteDetails(Document document, Quote quote) throws DocumentException {
        Font labelFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
        Font valueFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
        
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(20);
        table.setWidths(new int[]{1, 2});
        
        addDetailRow(table, "Quote Number:", quote.getQuoteNumber(), labelFont, valueFont);
        
        String clientName = quote.getClient() != null ? quote.getClient() : "N/A";
        addDetailRow(table, "Client:", clientName, labelFont, valueFont);
        
        String quoteDate = quote.getQuoteDate() != null ? 
            quote.getQuoteDate().format(DATE_FORMATTER) : "N/A";
        addDetailRow(table, "Date:", quoteDate, labelFont, valueFont);
        
        String validUntil = quote.getValidUntilDate() != null ? 
            quote.getValidUntilDate().format(DATE_FORMATTER) : "N/A";
        addDetailRow(table, "Valid Until:", validUntil, labelFont, valueFont);
        
        String status = quote.getQuoteStatus() != null ? quote.getQuoteStatus().toString() : "DRAFT";
        addDetailRow(table, "Status:", status, labelFont, valueFont);
        
        document.add(table);
        
        if (quote.getNotes() != null && !quote.getNotes().trim().isEmpty()) {
            Font descLabelFont = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD);
            Paragraph descLabel = new Paragraph("Notes:", descLabelFont);
            descLabel.setSpacingBefore(10);
            descLabel.setSpacingAfter(5);
            document.add(descLabel);
            
            PdfPTable descTable = new PdfPTable(1);
            descTable.setWidthPercentage(100);
            descTable.setSpacingAfter(20);
            
            PdfPCell descCell = new PdfPCell(new Phrase(quote.getNotes(), valueFont));
            descCell.setPadding(10);
            descCell.setBackgroundColor(ERHA_LIGHT_GRAY);
            descCell.setBorder(Rectangle.BOX);
            descTable.addCell(descCell);
            
            document.add(descTable);
        }
    }
    
    private void addAmountSection(Document document, Quote quote) throws DocumentException {
        Font labelFont = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD);
        Font valueFont = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL);
        Font totalFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, ERHA_DARK_BLUE);
        
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(60);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.setSpacingBefore(20);
        table.setSpacingAfter(30);
        table.setWidths(new int[]{3, 2});
        
        BigDecimal subtotal = quote.getValueExclVat() != null ? 
            quote.getValueExclVat() : BigDecimal.ZERO;
        addAmountRow(table, "Subtotal (Excl. VAT):", formatCurrency(subtotal), 
            labelFont, valueFont, false);
        
        BigDecimal vat = quote.getVatAmount() != null ? 
            quote.getVatAmount() : subtotal.multiply(new BigDecimal("0.15"));
        addAmountRow(table, "VAT (15%):", formatCurrency(vat), 
            labelFont, valueFont, false);
        
        BigDecimal total = quote.getValueInclVat() != null ? 
            quote.getValueInclVat() : subtotal.add(vat);
        addAmountRow(table, "TOTAL (Incl. VAT):", formatCurrency(total), 
            totalFont, totalFont, true);
        
        document.add(table);
    }
    
    private void addTermsAndConditions(Document document, Quote quote) throws DocumentException {
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
        Font contentFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL);
        
        Paragraph termsHeader = new Paragraph("Terms & Conditions", sectionFont);
        termsHeader.setSpacingBefore(20);
        termsHeader.setSpacingAfter(10);
        document.add(termsHeader);
        
        PdfPTable termsTable = new PdfPTable(1);
        termsTable.setWidthPercentage(100);
        
        StringBuilder termsContent = new StringBuilder();
        termsContent.append("1. Payment Terms: 30 days net from date of invoice\n");
        termsContent.append("2. Prices are valid for 30 days from quote date\n");
        termsContent.append("3. Delivery: As per agreed schedule\n");
        termsContent.append("4. Warranty: 12 months from date of delivery\n");
        termsContent.append("5. Work will commence upon receipt of signed quotation and deposit\n");
        termsContent.append("6. Prices exclude delivery unless otherwise stated\n");
        
        PdfPCell termsCell = new PdfPCell(new Phrase(termsContent.toString(), contentFont));
        termsCell.setPadding(10);
        termsCell.setBackgroundColor(ERHA_LIGHT_GRAY);
        termsCell.setBorder(Rectangle.BOX);
        termsTable.addCell(termsCell);
        
        document.add(termsTable);
    }
    
    private void addFooter(Document document, Quote quote) throws DocumentException {
        Font footerFont = new Font(Font.FontFamily.HELVETICA, 9, Font.ITALIC, BaseColor.DARK_GRAY);
        
        Paragraph footer = new Paragraph();
        footer.setSpacingBefore(30);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.add(new Chunk("Thank you for your business. We look forward to working with you.", footerFont));
        
        document.add(footer);
        
        Font contactFont = new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, BaseColor.DARK_GRAY);
        Paragraph contact = new Paragraph();
        contact.setSpacingBefore(10);
        contact.setAlignment(Element.ALIGN_CENTER);
        contact.add(new Chunk("ERHA Fabrication & Construction | Email: quotes@erha.co.za | Tel: +27 XX XXX XXXX", contactFont));
        
        document.add(contact);
    }
    
    private void addDetailRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        table.addCell(labelCell);
        
        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        table.addCell(valueCell);
    }
    
    private void addAmountRow(PdfPTable table, String label, String amount, Font labelFont, Font valueFont, boolean isTotal) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(isTotal ? Rectangle.TOP : Rectangle.NO_BORDER);
        labelCell.setPadding(8);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        if (isTotal) {
            labelCell.setBackgroundColor(ERHA_LIGHT_GRAY);
        }
        table.addCell(labelCell);
        
        PdfPCell valueCell = new PdfPCell(new Phrase(amount, valueFont));
        valueCell.setBorder(isTotal ? Rectangle.TOP : Rectangle.NO_BORDER);
        valueCell.setPadding(8);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        if (isTotal) {
            valueCell.setBackgroundColor(ERHA_LIGHT_GRAY);
        }
        table.addCell(valueCell);
    }
    
    private String formatCurrency(BigDecimal amount) {
        return String.format("R %,.2f", amount);
    }
}
