package com.example.demo.controller;

import com.example.demo.entity.ActivityLog;
import com.example.demo.entity.ConceptNode;
import com.example.demo.entity.KnowledgeGraph;
import com.example.demo.entity.SemanticEdge;

import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;

import com.example.demo.repository.ActivityLogRepository;
import com.example.demo.repository.ConceptNodeRepository;
import com.example.demo.repository.KnowledgeGraphRepository;
import com.example.demo.repository.SemanticEdgeRepository;

import com.example.demo.service.GraphOrchestratorService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/edges")
public class EdgeController {

    private final SemanticEdgeRepository edgeRepository;
    private final ConceptNodeRepository nodeRepository;
    private final KnowledgeGraphRepository graphRepository;
    private final GraphOrchestratorService graphOrchestratorService;
    private final ActivityLogRepository activityLogRepository;

    @Autowired
    public EdgeController(
            SemanticEdgeRepository edgeRepository,
            ConceptNodeRepository nodeRepository,
            KnowledgeGraphRepository graphRepository,
            GraphOrchestratorService graphOrchestratorService,
            ActivityLogRepository activityLogRepository) {

        this.edgeRepository = edgeRepository;
        this.nodeRepository = nodeRepository;
        this.graphRepository = graphRepository;
        this.graphOrchestratorService = graphOrchestratorService;
        this.activityLogRepository = activityLogRepository;
    }

    /**
     * GET /api/edges/graph/{graphId}
     *
     * Returns all edges belonging to the graph.
     */
    @GetMapping("/graph/{graphId}")
    public ResponseEntity<List<SemanticEdge>> getEdgesByGraph(
            @PathVariable Long graphId) {

        List<SemanticEdge> edges =
                edgeRepository.findAllByGraphId(graphId);

        return ResponseEntity.ok(edges);
    }

    /**
     * POST /api/edges/
     *
     * Creates a new relationship between two nodes.
     */
    @PostMapping("/")
    public ResponseEntity<SemanticEdge> createEdge(
            @RequestBody SemanticEdge edge) {

        if (edge.getSourceNode() == null ||
                edge.getSourceNode().getId() == null) {

            throw new BusinessValidationException(
                    "Source node is required."
            );
        }

        if (edge.getTargetNode() == null ||
                edge.getTargetNode().getId() == null) {

            throw new BusinessValidationException(
                    "Target node is required."
            );
        }

        ConceptNode source =
                nodeRepository.findById(
                        edge.getSourceNode().getId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Source node not found."
                        )
                );

        ConceptNode target =
                nodeRepository.findById(
                        edge.getTargetNode().getId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Target node not found."
                        )
                );

        if (!Objects.equals(
                source.getGraph().getId(),
                target.getGraph().getId())) {

            throw new BusinessValidationException(
                    "Source and target nodes must belong " +
                    "to the same graph."
            );
        }

        KnowledgeGraph graph =
                source.getGraph();

        edge.setSourceNode(source);
        edge.setTargetNode(target);
        edge.setGraph(graph);

        SemanticEdge savedEdge =
                edgeRepository.save(edge);

        /*
         * Recalculate graph complexity
         */
        graphOrchestratorService.calculateComplexity(
                graph.getId()
        );

        /*
         * Activity log
         */
        saveEdgeActivity(
                "CREATE_RELATIONSHIP",
                savedEdge
        );

        return ResponseEntity
                .status(201)
                .body(savedEdge);
    }

    /**
     * PUT /api/edges/{edgeId}
     *
     * Updates an existing relationship.
     */
    @PutMapping("/{edgeId}")
    @PreAuthorize(
            "hasAnyRole('KNOWLEDGE_ARCHITECT','RESEARCH_STRATEGIST')"
    )
    public ResponseEntity<SemanticEdge> updateEdge(
            @PathVariable Long edgeId,
            @RequestBody SemanticEdge request) {

        SemanticEdge existing =
                edgeRepository.findById(edgeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Relationship not found: " +
                                        edgeId
                                )
                        );

        Long sourceId =
                request.getSourceNode() != null
                        ? request.getSourceNode().getId()
                        : null;

        Long targetId =
                request.getTargetNode() != null
                        ? request.getTargetNode().getId()
                        : null;

        if (sourceId == null ||
                targetId == null) {

            throw new BusinessValidationException(
                    "Source and target nodes are required."
            );
        }

        ConceptNode source =
                nodeRepository.findById(sourceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Source node not found."
                                )
                        );

        ConceptNode target =
                nodeRepository.findById(targetId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Target node not found."
                                )
                        );

        if (!Objects.equals(
                source.getGraph().getId(),
                target.getGraph().getId())) {

            throw new BusinessValidationException(
                    "Source and target nodes must belong " +
                    "to the same graph."
            );
        }

        existing.setSourceNode(source);
        existing.setTargetNode(target);

        existing.setRelationshipType(
                request.getRelationshipType()
        );

        existing.setConnectionStrength(
                request.getConnectionStrength()
        );

        existing.setGraph(
                source.getGraph()
        );

        SemanticEdge saved =
                edgeRepository.save(existing);

        /*
         * Recalculate graph complexity
         */
        graphOrchestratorService.calculateComplexity(
                source.getGraph().getId()
        );

        /*
         * Activity log
         */
        saveEdgeActivity(
                "UPDATE_RELATIONSHIP",
                saved
        );

        return ResponseEntity.ok(saved);
    }

    /**
     * DELETE /api/edges/{edgeId}
     *
     * Deletes an existing relationship.
     */
    @DeleteMapping("/{edgeId}")
    @PreAuthorize(
            "hasAnyRole('KNOWLEDGE_ARCHITECT','RESEARCH_STRATEGIST')"
    )
    public ResponseEntity<Void> deleteEdge(
            @PathVariable Long edgeId) {

        SemanticEdge edge =
                edgeRepository.findById(edgeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Relationship not found: " +
                                        edgeId
                                )
                        );

        Long graphId =
                edge.getGraph().getId();

        /*
         * Activity must be saved before deleting
         * the relationship so its node information
         * is still available.
         */
        saveEdgeActivity(
                "DELETE_RELATIONSHIP",
                edge
        );

        edgeRepository.delete(edge);

        /*
         * Recalculate graph complexity
         */
        graphOrchestratorService.calculateComplexity(
                graphId
        );

        return ResponseEntity
                .noContent()
                .build();
    }

    /**
     * Saves activity information for relationship actions.
     */
    private void saveEdgeActivity(
            String activityType,
            SemanticEdge edge) {

        if (edge == null ||
                edge.getGraph() == null ||
                edge.getGraph().getOwner() == null ||
                edge.getGraph().getOwner().getId() == null) {

            return;
        }

        ActivityLog activityLog =
                new ActivityLog();

        activityLog.setType(
                activityType
        );

        String sourceLabel =
                edge.getSourceNode() != null
                        ? edge.getSourceNode().getLabel()
                        : "Unknown";

        String targetLabel =
                edge.getTargetNode() != null
                        ? edge.getTargetNode().getLabel()
                        : "Unknown";

        activityLog.setTargetTitle(
                sourceLabel +
                " → " +
                targetLabel
        );

        activityLog.setOwnerId(
                edge.getGraph()
                        .getOwner()
                        .getId()
        );

        activityLogRepository.save(
                activityLog
        );
    }
}