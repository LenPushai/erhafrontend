package com.erha.ops.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DocuSignConfig {

    @Value("${docusign.integration-key}")
    private String integrationKey;

    @Value("${docusign.secret-key}")
    private String secretKey;

    @Value("${docusign.account-id}")
    private String accountId;

    @Value("${docusign.base-path}")
    private String basePath;

    @Value("${docusign.oauth-base-path}")
    private String oauthBasePath;

    @Value("${docusign.user-id}")
    private String userId;

    public String getIntegrationKey() {
        return integrationKey;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getAccountId() {
        return accountId;
    }

    public String getBasePath() {
        return basePath;
    }

    public String getOauthBasePath() {
        return oauthBasePath;
    }

    public String getUserId() {
        return userId;
    }
}
