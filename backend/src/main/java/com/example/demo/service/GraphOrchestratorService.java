package com.example.demo.service;

import com.example.demo.entity.ConceptNode;
import com.example.demo.entity.KnowledgeGraph;
import com.example.demo.entity.SemanticEdge;
import com.example.demo.event.GraphComplexityEvent;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ConceptNodeRepository;
import com.example.demo.repository.KnowledgeGraphRepository;
import com.example.demo.repository.SemanticEdgeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
public class GraphOrchestratorService {
    private final KnowledgeGraphRepository graphRepository;
    private final ApplicationEventPublisher eventPublisher;
    @Autowired
    private ConceptNodeRepository nodeRepository;

    @Autowired
    private SemanticEdgeRepository edgeRepository;

    @Autowired
    public GraphOrchestratorService(
            KnowledgeGraphRepository graphRepository,
            ApplicationEventPublisher eventPublisher) {

        this.graphRepository = graphRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public KnowledgeGraph createGraph(
            KnowledgeGraph graph) {

        if (graph.getOwner() == null
                || graph.getOwner().getId() == null) {

            throw new BusinessValidationException(
                    "A valid graph owner is required."
            );
        }

        boolean graphExists =
                graphRepository
                        .existsByOwnerIdAndTitleIgnoreCase(
                                graph.getOwner().getId(),
                                graph.getTitle()
                        );

        if (graphExists) {

            throw new BusinessValidationException(
                    "Graph title already exists for this owner."
            );
        }

        graph.setComplexityScore(0.0);

        KnowledgeGraph savedGraph =
                graphRepository.save(graph);

        int nodeCount =
                savedGraph.getNodes() == null
                        ? 0
                        : savedGraph.getNodes().size();

        int edgeCount =
                savedGraph.getEdges() == null
                        ? 0
                        : savedGraph.getEdges().size();

        eventPublisher.publishEvent(
                new GraphComplexityEvent(
                        this,
                        savedGraph.getId(),
                        nodeCount,
                        edgeCount
                )
        );

        return savedGraph;
    }

    @Transactional(readOnly = true)
    public List<KnowledgeGraph> getAllGraphs() {

        return graphRepository.findAll();
    }

    @Transactional(readOnly = true)
    public KnowledgeGraph getGraphById(
            Long id) {

        return graphRepository
                .findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Knowledge Graph not found with ID: "
                                        + id
                        )
                );
    }

    @Transactional
    public KnowledgeGraph updateGraph(
            Long id,
            KnowledgeGraph updatedGraph) {

        KnowledgeGraph existingGraph =
                graphRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "Knowledge Graph not found with ID: "
                                                + id
                                )
                        );

        existingGraph.setTitle(
                updatedGraph.getTitle()
        );

        existingGraph.setDescription(
                updatedGraph.getDescription()
        );

        if (updatedGraph.getIsPublic() != null) {

            existingGraph.setIsPublic(
                    updatedGraph.getIsPublic()
            );
        }

        return graphRepository.save(
                existingGraph
        );
    }

    @Transactional
    public void deleteGraph(
            Long id) {

        graphRepository.deleteById(id);
    }

    @Transactional
    public KnowledgeGraph calculateComplexity(
            Long graphId) {

        KnowledgeGraph graph =
                graphRepository
                        .findById(graphId)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "Knowledge Graph not found with ID: "
                                                + graphId
                                )
                        );

        List<ConceptNode> nodes =
                nodeRepository
                        .findAllByGraphId(graphId);

        List<SemanticEdge> edges =
                edgeRepository
                        .findAllByGraphId(graphId);

        double nodeCount =
                Math.max(nodes.size(), 1);

        double complexityScore =
                (edges.size() * 2.0)
                        / nodeCount;

        graph.setComplexityScore(
                complexityScore
        );

        KnowledgeGraph updatedGraph =
                graphRepository.save(graph);

        eventPublisher.publishEvent(
                new GraphComplexityEvent(
                        this,
                        updatedGraph.getId(),
                        nodes.size(),
                        edges.size()
                )
        );

        return updatedGraph;
    }
}