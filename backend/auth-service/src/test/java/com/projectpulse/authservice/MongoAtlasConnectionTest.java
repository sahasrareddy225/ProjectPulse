package com.projectpulse.authservice;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Minimal live connection test verifying MongoDB Atlas reachability.
 * This test only executes when the AUTH_DB_URI environment variable is explicitly provided.
 */
class MongoAtlasConnectionTest {

    @Test
    @DisplayName("Verify live MongoDB Atlas connection by executing ping command")
    @EnabledIfEnvironmentVariable(named = "AUTH_DB_URI", matches = ".+")
    void shouldConnectToMongoAtlasAndPingSuccessfully() {
        String uri = System.getenv("AUTH_DB_URI");
        assertNotNull(uri, "AUTH_DB_URI must not be null when test is enabled");

        try (MongoClient mongoClient = MongoClients.create(uri)) {
            MongoDatabase database = mongoClient.getDatabase("auth_db");
            Document pingCommand = new Document("ping", 1);
            Document response = database.runCommand(pingCommand);

            assertNotNull(response, "Ping response from MongoDB Atlas should not be null");
            Number okValue = (Number) response.get("ok");
            assertNotNull(okValue, "ok field in ping response must be present");
            assertEquals(1.0, okValue.doubleValue(), 0.001, "Expected ping command ok: 1.0 from Atlas");
        }
    }
}
