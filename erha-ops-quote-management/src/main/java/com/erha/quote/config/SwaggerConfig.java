package com.erha.quote.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * ðŸ“š Swagger/OpenAPI Configuration
 * API documentation configuration for Quote Management
 */
@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI quoteManagementOpenAPI() {
        Server devServer = new Server();
        devServer.setUrl("http://localhost:8080");
        devServer.setDescription("Development server");
        
        Contact contact = new Contact();
        contact.setEmail("info@erha.co.za");
        contact.setName("Dynamic Duo Engineering Team");
        contact.setUrl("https://erha.co.za");
        
        License license = new License()
            .name("MIT License")
            .url("https://choosealicense.com/licenses/mit/");
        
        Info info = new Info()
            .title("ERHA Quote Management API")
            .version("1.0.0")
            .contact(contact)
            .description("Professional quote creation, approval, and client communication with quality assurance costing")
            .license(license);
        
        return new OpenAPI()
            .info(info)
            .servers(List.of(devServer));
    }
}
