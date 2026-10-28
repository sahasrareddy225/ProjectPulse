package com.projectpulse.authservice;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Live connection integration test verifying MongoDB Atlas reachability.
 * Tagged as @Tag("integration") and opt-in so it does not fail default offline builds.
 *
 * To execute explicitly:
 * ./mvnw test -pl auth-service -Dtest=MongoAtlasConnectionTest -DrunAtlasTest=true
 * or export RUN_ATLAS_TEST=true with AUTH_DB_URI configured in your environment.
 */
@Tag("integration")
class MongoAtlasConnectionTest {

    static boolean isAtlasTestExplicitlyRequested() {
        boolean propEnabled = Boolean.parseBoolean(System.getProperty("runAtlasTest", "false"));
        boolean envEnabled = Boolean.parseBoolean(System.getenv().getOrDefault("RUN_ATLAS_TEST", "false"));
        String uri = System.getenv("AUTH_DB_URI");
        return (propEnabled || envEnabled) && uri != null && !uri.isBlank();
    }

    @Test
    @DisplayName("Verify live MongoDB Atlas connection by executing ping command")
    @EnabledIf("isAtlasTestExplicitlyRequested")
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
