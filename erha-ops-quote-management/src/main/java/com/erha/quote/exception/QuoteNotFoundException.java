package com.erha.quote.exception;

/**
 * ðŸš« Quote Not Found Exception
 * Thrown when a requested quote cannot be found
 */
public class QuoteNotFoundException extends RuntimeException {
    
    public QuoteNotFoundException(String message) {
        super(message);
    }
    
    public QuoteNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
