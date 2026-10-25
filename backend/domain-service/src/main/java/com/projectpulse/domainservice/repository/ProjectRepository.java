package com.projectpulse.domainservice.repository;

import com.projectpulse.domainservice.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {

    List<Project> findAllByOrderByCreatedAtDesc();

    boolean existsByNameIgnoreCase(String name);
}
