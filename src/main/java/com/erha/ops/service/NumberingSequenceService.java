package com.erha.ops.service;

import com.erha.ops.entity.NumberingSequence;
import com.erha.ops.repository.NumberingSequenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.Year;

@Service
public class NumberingSequenceService {
    @Autowired
    private NumberingSequenceRepository numberingSequenceRepository;
    
    @Transactional
    public synchronized String generateNextNumber(String sequenceType) {
        NumberingSequence sequence = numberingSequenceRepository
            .findBySequenceTypeWithLock(sequenceType)
            .orElseGet(() -> createDefaultSequence(sequenceType));
        
        int currentYear = Year.now().getValue();
        if (sequence.getYear() != null && sequence.getYear() != currentYear) {
            sequence.setYear(currentYear);
            sequence.setCurrentNumber(1);
        }
        
        int nextNumber = sequence.getCurrentNumber() + 1;
        sequence.setCurrentNumber(nextNumber);
        sequence.setUpdatedDate(LocalDateTime.now());
        numberingSequenceRepository.save(sequence);
        return formatNumber(sequence, nextNumber);
    }
    
    public String getCurrentNumber(String sequenceType) {
        NumberingSequence sequence = numberingSequenceRepository
            .findBySequenceType(sequenceType)
            .orElseGet(() -> createDefaultSequence(sequenceType));
        return formatNumber(sequence, sequence.getCurrentNumber());
    }
    
    private NumberingSequence createDefaultSequence(String sequenceType) {
        NumberingSequence sequence = new NumberingSequence();
        sequence.setSequenceType(sequenceType);
        sequence.setCurrentNumber(0);
        sequence.setYear(Year.now().getValue());
        sequence.setPaddingLength(3);
        sequence.setUpdatedDate(LocalDateTime.now());
        
        switch (sequenceType.toUpperCase()) {
            case "JOB":
                sequence.setPrefix(String.valueOf(Year.now().getValue() % 100));
                break;
            case "RFQ":
                sequence.setPrefix("RFQ-" + Year.now().getValue());
                break;
            case "QUOTE":
                sequence.setPrefix("NE");
                sequence.setPaddingLength(6);
                break;
            case "INVOICE":
                sequence.setPrefix("IN");
                sequence.setPaddingLength(6);
                break;
            default:
                sequence.setPrefix(sequenceType.toUpperCase());
        }
        return numberingSequenceRepository.save(sequence);
    }
    
    private String formatNumber(NumberingSequence sequence, int number) {
        String prefix = sequence.getPrefix() != null ? sequence.getPrefix() : "";
        int padding = sequence.getPaddingLength() != null ? sequence.getPaddingLength() : 3;
        
        if (sequence.getSequenceType().equalsIgnoreCase("JOB")) {
            return String.format("%s-%0" + padding + "d", prefix, number);
        }
        
        if (prefix.isEmpty()) {
            return String.format("%0" + padding + "d", number);
        } else if (prefix.endsWith("-")) {
            return String.format("%s%0" + padding + "d", prefix, number);
        } else {
            return String.format("%s%0" + padding + "d", prefix, number);
        }
    }
    
    @Transactional
    public void resetSequence(String sequenceType, int startNumber) {
        NumberingSequence sequence = numberingSequenceRepository
            .findBySequenceType(sequenceType)
            .orElseGet(() -> createDefaultSequence(sequenceType));
        sequence.setCurrentNumber(startNumber);
        sequence.setUpdatedDate(LocalDateTime.now());
        numberingSequenceRepository.save(sequence);
    }
}