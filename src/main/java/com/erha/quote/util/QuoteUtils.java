package com.erha.quote.util;

import java.util.UUID;

/**
 * Utility class for Quote Management
 * Handles common conversions and validations
 */
public class QuoteUtils {
    
    /**
     * Safely converts Long ID to UUID
     * @param longId the Long ID to convert
     * @return UUID representation
     */
    public static UUID longToUUID(Long longId) {
        if (longId == null) {
            return null;
        }
        // Create UUID from long value - this is a simple approach
        // In production, you might want a different mapping strategy
        String uuidString = String.format("00000000-0000-0000-0000-%012d", longId);
        return UUID.fromString(uuidString);
    }
    
    /**
     * Safely converts String ID to UUID
     * @param stringId the String ID to convert
     * @return UUID representation
     */
    public static UUID stringToUUID(String stringId) {
        if (stringId == null || stringId.trim().isEmpty()) {
            return null;
        }
        
        try {
            return UUID.fromString(stringId);
        } catch (IllegalArgumentException e) {
            // If string is not a valid UUID, try to parse as Long first
            try {
                Long longValue = Long.parseLong(stringId);
                return longToUUID(longValue);
            } catch (NumberFormatException nfe) {
                throw new IllegalArgumentException("Cannot convert '" + stringId + "' to UUID", e);
            }
        }
    }
    
    /**
     * Generates a sequential quote number
     * @param sequence the sequence number
     * @return formatted quote number
     */
    public static String generateQuoteNumber(Long sequence) {
        int year = java.time.LocalDate.now().getYear();
        return String.format("QUO-%d-%05d", year, sequence);
    }
}
