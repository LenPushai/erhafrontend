package com.erha.quote.exception;

/**
 * âš ï¸ Quote Validation Exception
 * Thrown when quote data validation fails
 */
public class QuoteValidationException extends RuntimeException {
    
    public QuoteValidationException(String message) {
        super(message);
    }
    
    public QuoteValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
