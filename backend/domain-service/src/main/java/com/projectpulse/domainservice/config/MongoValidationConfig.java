package com.projectpulse.domainservice.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.Set;

@Configuration
public class MongoValidationConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoValidationConfig.class);

    @Value("${spring.mongodb.uri:${spring.data.mongodb.uri:}}")
    private String mongoUri;

    @Value("${spring.mongodb.database:${spring.data.mongodb.database:domain_db}}")
    private String databaseName;

    private final MongoTemplate mongoTemplate;

    public MongoValidationConfig(@org.springframework.beans.factory.annotation.Autowired(required = false) MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @PostConstruct
    public void validateMongoConfiguration() {
        if (mongoUri == null || mongoUri.isBlank() || mongoUri.contains("${")) {
            throw new IllegalStateException(
                "Missing required MongoDB URI (DOMAIN_DB_URI or AUTH_DB_URI). " +
                "Please configure AUTH_DB_URI or DOMAIN_DB_URI with your MongoDB Atlas connection string."
            );
        }

        String safeHost = extractSafeHost(mongoUri);
        log.info("[DomainMongoConfig] URI is configured. Cluster host: {}", safeHost);
        log.info("[DomainMongoConfig] Target database: {}", databaseName);

        if (mongoTemplate != null) {
            try {
                String activeDb = mongoTemplate.getDb().getName();
                Set<String> collections = mongoTemplate.getCollectionNames();
                log.info("[DomainMongoConfig] Connected to database: '{}', Collections: {}", activeDb, collections);
            } catch (Exception e) {
                log.warn("[DomainMongoConfig] Startup collection check failed: {}", e.getMessage());
            }
        }
    }

    static String extractSafeHost(String uri) {
        if (uri == null || uri.isBlank()) return "<empty>";
        try {
            String s = uri.replaceFirst("mongodb(\\+srv)?://", "");
            int atIdx = s.lastIndexOf('@');
            if (atIdx >= 0) s = s.substring(atIdx + 1);
            int slashIdx = s.indexOf('/');
            if (slashIdx >= 0) s = s.substring(0, slashIdx);
            int queryIdx = s.indexOf('?');
            if (queryIdx >= 0) s = s.substring(0, queryIdx);
            return s.isBlank() ? "<unknown>" : s;
        } catch (Exception e) {
            return "<parse-error>";
        }
    }
}
