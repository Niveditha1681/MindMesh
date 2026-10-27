package com.example.demo.repository;

import com.example.demo.entity.SemanticEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SemanticEdgeRepository
        extends JpaRepository<SemanticEdge, Long> {

    List<SemanticEdge> findAllByGraphId(Long graphId);

    List<SemanticEdge>
    findAllBySourceNodeIdOrTargetNodeId(
            Long sourceNodeId,
            Long targetNodeId
    );
}