package com.projectpulse.domainservice.repository;

import com.projectpulse.domainservice.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {

    List<Task> findByProjectId(String projectId);

    List<Task> findByProjectIdOrderByCreatedAtDesc(String projectId);

    List<Task> findAllByOrderByCreatedAtDesc();

    long countByProjectId(String projectId);

    long countByProjectIdAndStatus(String projectId, String status);

    List<Task> findByAssigneeId(String assigneeId);
}
