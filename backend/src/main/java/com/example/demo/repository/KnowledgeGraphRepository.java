package com.example.demo.repository;

import com.example.demo.entity.KnowledgeGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeGraphRepository extends JpaRepository<KnowledgeGraph, Long> {

    Page<KnowledgeGraph> findAllByOwnerId(Long ownerId, Pageable pageable);

    boolean existsByOwnerIdAndTitleIgnoreCase(Long ownerId, String title);

    List<KnowledgeGraph> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title,
            String description
    );

    @Query("SELECT g FROM KnowledgeGraph g WHERE g.isPublic = true")
    Page<KnowledgeGraph> findAllPublicGraphs(Pageable pageable);

    long countByIsPublicTrue();
}