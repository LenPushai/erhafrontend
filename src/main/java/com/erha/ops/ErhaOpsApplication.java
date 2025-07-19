package com.erha.ops;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class ErhaOpsApplication {
    public static void main(String[] args) {
        SpringApplication.run(ErhaOpsApplication.class, args);
    }
}