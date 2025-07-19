package com.erha.quote;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * ðŸš€ðŸ’° ERHA Quote Management Application
 * Professional quote creation, approval, and client communication
 * 
 * @author Dynamic Duo Engineering Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
public class QuoteManagementApplication {
    
    public static void main(String[] args) {
        System.out.println("ðŸ”¥ðŸ’° ERHA QUOTE MANAGEMENT STARTING UP! ðŸ’°ðŸ”¥");
        SpringApplication.run(QuoteManagementApplication.class, args);
        System.out.println("âš¡ QUOTE MANAGEMENT MODULE READY FOR ACTION! âš¡");
    }
}
