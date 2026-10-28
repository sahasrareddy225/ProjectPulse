package com.projectpulse.authservice.config;

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

    @Value("${spring.mongodb.database:${spring.data.mongodb.database:auth_db}}")
    private String databaseName;

    private final MongoTemplate mongoTemplate;

    public MongoValidationConfig(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @PostConstruct
    public void validateMongoConfiguration() {
        if (mongoUri == null || mongoUri.isBlank() || mongoUri.equals("${AUTH_DB_URI}")) {
            throw new IllegalStateException(
                "Missing required environment variable AUTH_DB_URI. " +
                "Please configure AUTH_DB_URI with your MongoDB Atlas connection string."
            );
        }

        // Log safe connection info (cluster host only — no credentials, no full URI)
        String safeHost = extractSafeHost(mongoUri);
        log.info("[MongoConfig] AUTH_DB_URI is set. Cluster host: {}", safeHost);
        log.info("[MongoConfig] Configured database name: {}", databaseName);

        // Verify live connection: show active database name and collections
        try {
            String activeDb = mongoTemplate.getDb().getName();
            Set<String> collections = mongoTemplate.getCollectionNames();
            log.info("[MongoConfig] Live database: '{}', Collections: {}", activeDb, collections);
        } catch (Exception e) {
            log.warn("[MongoConfig] Could not enumerate collections at startup: {}", e.getMessage());
        }
    }

    /**
     * Extracts only the cluster hostname from a MongoDB URI — no credentials exposed.
     * Example input with userinfo returns "cluster.example.net".
     */
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
