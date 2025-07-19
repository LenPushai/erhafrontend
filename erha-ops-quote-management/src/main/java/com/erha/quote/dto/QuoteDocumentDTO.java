package com.erha.quote.dto;

import com.erha.quote.model.DocumentType;
import com.erha.quote.model.QuoteDocument;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

/**
 * ðŸ“„ Quote Document Data Transfer Object
 * API request/response object for quote document operations
 */
public class QuoteDocumentDTO {
    
    private Long id;
    private Long quoteId;
    
    @NotBlank(message = "Document name is required")
    private String documentName;
    
    private String filePath;
    private String fileType;
    private Long fileSize;
    private DocumentType documentType;
    private String description;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    
    // ðŸŽ¯ CONSTRUCTORS
    public QuoteDocumentDTO() {}
    
    public QuoteDocumentDTO(QuoteDocument document) {
        this.id = document.getId();
        this.quoteId = document.getQuote() != null ? document.getQuote().getId() : null;
        this.documentName = document.getDocumentName();
        this.filePath = document.getFilePath();
        this.fileType = document.getFileType();
        this.fileSize = document.getFileSize();
        this.documentType = document.getDocumentType();
        this.description = document.getDescription();
        this.uploadedBy = document.getUploadedBy();
        this.uploadedAt = document.getUploadedAt();
    }
    
    // ðŸŽ¯ GETTERS AND SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getQuoteId() { return quoteId; }
    public void setQuoteId(Long quoteId) { this.quoteId = quoteId; }
    
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    
    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
    
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
