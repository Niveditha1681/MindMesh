package com.example.demo.repository;

import com.example.demo.entity.ConceptNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConceptNodeRepository extends JpaRepository<ConceptNode, Long> {

    List<ConceptNode> findAllByGraphId(Long graphId);
    

}