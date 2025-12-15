package com.erha.ops.service;

import com.erha.ops.entity.Job;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class JobPdfService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final BaseColor ERHA_DARK_BLUE = new BaseColor(25, 55, 109);
    private static final BaseColor ERHA_LIGHT_GRAY = new BaseColor(245, 245, 245);
    private static final BaseColor ERHA_ORANGE = new BaseColor(255, 140, 0);
    
    public byte[] generateJobCardPdf(Job job) throws DocumentException, IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 50, 50);
        PdfWriter.getInstance(document, out);
        document.open();
        
        addHeader(document, job);
        addJobDetails(document, job);
        addOrderDetails(document, job);
        addProgressSection(document, job);
        addFooter(document, job);
        
        document.close();
        return out.toByteArray();
    }
    
    private void addHeader(Document document, Job job) throws DocumentException {
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
        
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, ERHA_ORANGE);
        Paragraph title = new Paragraph("JOB CARD", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(30);
        document.add(title);
    }
    
    private void addJobDetails(Document document, Job job) throws DocumentException {
        Font labelFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
        Font valueFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
        
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(20);
        table.setWidths(new int[]{1, 2});
        
        addDetailRow(table, "Job Number:", job.getJobNumber() != null ? job.getJobNumber() : "N/A", labelFont, valueFont);
        
        String jobType = job.getJobType() != null ? job.getJobType().toString() : "NORMAL";
        addDetailRow(table, "Job Type:", jobType, labelFont, valueFont);
        
        String orderDate = job.getOrderReceivedDate() != null ? 
            job.getOrderReceivedDate().format(DATE_FORMATTER) : "N/A";
        addDetailRow(table, "Order Received:", orderDate, labelFont, valueFont);
        
        String status = job.getStatus() != null ? job.getStatus().toString() : "NEW";
        Font statusFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, getStatusColor(job.getStatus()));
        addDetailRow(table, "Status:", status, labelFont, statusFont);
        
        String priority = job.getPriority() != null ? job.getPriority().toString() : "MEDIUM";
        Font priorityFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, getPriorityColor(job.getPriority()));
        addDetailRow(table, "Priority:", priority, labelFont, priorityFont);
        
        String location = job.getLocation() != null ? job.getLocation().toString() : "SHOP";
        addDetailRow(table, "Location:", location, labelFont, valueFont);
        
        document.add(table);
        
        if (job.getDescription() != null && !job.getDescription().trim().isEmpty()) {
            Font descLabelFont = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD);
            Paragraph descLabel = new Paragraph("Job Description:", descLabelFont);
            descLabel.setSpacingBefore(10);
            descLabel.setSpacingAfter(5);
            document.add(descLabel);
            
            PdfPTable descTable = new PdfPTable(1);
            descTable.setWidthPercentage(100);
            descTable.setSpacingAfter(20);
            
            PdfPCell descCell = new PdfPCell(new Phrase(job.getDescription(), valueFont));
            descCell.setPadding(10);
            descCell.setBackgroundColor(ERHA_LIGHT_GRAY);
            descCell.setBorder(Rectangle.BOX);
            descTable.addCell(descCell);
            
            document.add(descTable);
        }
    }
    
    private void addOrderDetails(Document document, Job job) throws DocumentException {
        Font labelFont = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD);
        Font valueFont = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL);
        Font totalFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, ERHA_DARK_BLUE);
        
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(60);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.setSpacingBefore(20);
        table.setSpacingAfter(30);
        table.setWidths(new int[]{3, 2});
        
        BigDecimal orderExcl = job.getOrderValueExcl() != null ? 
            job.getOrderValueExcl() : BigDecimal.ZERO;
        addAmountRow(table, "Order Value (Excl. VAT):", formatCurrency(orderExcl), 
            labelFont, valueFont, false);
        
        BigDecimal vat = orderExcl.multiply(new BigDecimal("0.15"));
        addAmountRow(table, "VAT (15%):", formatCurrency(vat), 
            labelFont, valueFont, false);
        
        BigDecimal orderIncl = job.getOrderValueIncl() != null ? 
            job.getOrderValueIncl() : orderExcl.add(vat);
        addAmountRow(table, "TOTAL (Incl. VAT):", formatCurrency(orderIncl), 
            totalFont, totalFont, true);
        
        document.add(table);
    }
    
    private void addProgressSection(Document document, Job job) throws DocumentException {
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
        Font contentFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL);
        
        Paragraph progressHeader = new Paragraph("Progress Tracking", sectionFont);
        progressHeader.setSpacingBefore(20);
        progressHeader.setSpacingAfter(10);
        document.add(progressHeader);
        
        PdfPTable progressTable = new PdfPTable(1);
        progressTable.setWidthPercentage(100);
        
        int progress = job.getProgressPercentage() != null ? job.getProgressPercentage() : 0;
        
        StringBuilder progressContent = new StringBuilder();
        progressContent.append("Current Progress: ").append(progress).append("%\n\n");
        progressContent.append("Progress Milestones:\n");
        progressContent.append("? Materials Received\n");
        progressContent.append("? Fabrication Started\n");
        progressContent.append("? Quality Inspection\n");
        progressContent.append("? Assembly Complete\n");
        progressContent.append("? Final Testing\n");
        progressContent.append("? Ready for Delivery\n");
        
        PdfPCell progressCell = new PdfPCell(new Phrase(progressContent.toString(), contentFont));
        progressCell.setPadding(10);
        progressCell.setBackgroundColor(ERHA_LIGHT_GRAY);
        progressCell.setBorder(Rectangle.BOX);
        progressTable.addCell(progressCell);
        
        document.add(progressTable);
    }
    
    private void addFooter(Document document, Job job) throws DocumentException {
        Font footerFont = new Font(Font.FontFamily.HELVETICA, 9, Font.ITALIC, BaseColor.DARK_GRAY);
        
        Paragraph footer = new Paragraph();
        footer.setSpacingBefore(30);
        footer.setAlignment(Element.ALIGN_CENTER);
        
        String createdBy = job.getCreatedBy() != null ? job.getCreatedBy() : "System";
        String createdDate = job.getCreatedDate() != null ? 
            job.getCreatedDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")) : "N/A";
        
        footer.add(new Chunk("Job Card Created by: " + createdBy + " on " + createdDate, footerFont));
        
        document.add(footer);
        
        Font contactFont = new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, BaseColor.DARK_GRAY);
        Paragraph contact = new Paragraph();
        contact.setSpacingBefore(10);
        contact.setAlignment(Element.ALIGN_CENTER);
        contact.add(new Chunk("ERHA Fabrication & Construction | Email: jobs@erha.co.za | Tel: +27 XX XXX XXXX", contactFont));
        
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
    
    private BaseColor getStatusColor(Job.JobStatus status) {
        if (status == null) return BaseColor.BLACK;
        switch (status) {
            case NEW:
                return new BaseColor(0, 150, 255);
            case IN_PROGRESS:
                return new BaseColor(255, 140, 0);
            case COMPLETE:
                return new BaseColor(0, 150, 0);
            case DELIVERED:
                return new BaseColor(255, 0, 0);
            default:
                return BaseColor.BLACK;
        }
    }
    
    private BaseColor getPriorityColor(Job.JobPriority priority) {
        if (priority == null) return BaseColor.BLACK;
        switch (priority) {
            case LOW:
                return new BaseColor(0, 150, 0);
            case MEDIUM:
                return new BaseColor(255, 140, 0);
            case HIGH:
                return new BaseColor(255, 0, 0);
            case URGENT:
                return new BaseColor(139, 0, 0);
            default:
                return BaseColor.BLACK;
        }
    }
}


