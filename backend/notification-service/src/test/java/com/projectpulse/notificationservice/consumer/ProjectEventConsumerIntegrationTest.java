package com.projectpulse.notificationservice.consumer;

import com.projectpulse.notificationservice.event.ProjectCreatedEvent;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.listener.MessageListenerContainer;
import org.springframework.kafka.support.SendResult;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.kafka.test.utils.ContainerTestUtils;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@DirtiesContext
@EmbeddedKafka(
        partitions = 1,
        topics = {"project-events"},
        bootstrapServersProperty = "spring.kafka.bootstrap-servers"
)
@TestPropertySource(properties = {
        "eureka.client.enabled=false",
        "spring.cloud.config.enabled=false"
})
class ProjectEventConsumerIntegrationTest {

    @Autowired
    private EmbeddedKafkaBroker embeddedKafkaBroker;

    @Autowired
    private KafkaListenerEndpointRegistry kafkaListenerEndpointRegistry;

    @Autowired
    private ProjectEventConsumer consumer;

    @Test
    @DisplayName("End-to-end EmbeddedKafka flow: publish ProjectCreatedEvent and verify consumption")
    void shouldConsumeProjectCreatedEventFromEmbeddedKafka() throws Exception {
        consumer.clear();

        // Wait until consumer container is assigned partitions before producing
        for (MessageListenerContainer container : kafkaListenerEndpointRegistry.getListenerContainers()) {
            ContainerTestUtils.waitForAssignment(container, embeddedKafkaBroker.getPartitionsPerTopic());
        }

        Map<String, Object> producerProps = new HashMap<>(KafkaTestUtils.producerProps(embeddedKafkaBroker));
        producerProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        producerProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        ProducerFactory<String, Object> pf = new DefaultKafkaProducerFactory<>(producerProps);
        KafkaTemplate<String, Object> testTemplate = new KafkaTemplate<>(pf);

        ProjectCreatedEvent event = new ProjectCreatedEvent(
                "proj-embedded-1",
                "Flagship Initiative",
                "Elena Rostova",
                System.currentTimeMillis()
        );

        SendResult<String, Object> sendResult = testTemplate.send("project-events", event.getProjectId(), event).get(5, TimeUnit.SECONDS);
        assertNotNull(sendResult.getRecordMetadata(), "SendResult record metadata should be present");

        // Await consumption within 10 seconds
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            List<ProjectCreatedEvent> received = consumer.getReceivedEvents();
            assertFalse(received.isEmpty(), "Consumer should have received at least one event");
            ProjectCreatedEvent consumed = received.get(0);
            assertEquals("proj-embedded-1", consumed.getProjectId());
            assertEquals("Flagship Initiative", consumed.getName());
            assertEquals("Elena Rostova", consumed.getOwner());
        });
    }
}
