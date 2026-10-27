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
import com.example.demo.service.SpatialLogicService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nodes")
public class NodeController {

    private final ConceptNodeRepository nodeRepository;
    private final KnowledgeGraphRepository graphRepository;
    private final SemanticEdgeRepository semanticEdgeRepository;
    private final SpatialLogicService spatialLogicService;
    private final GraphOrchestratorService graphOrchestratorService;
    private final ActivityLogRepository activityLogRepository;

    @Autowired
    public NodeController(
            ConceptNodeRepository nodeRepository,
            KnowledgeGraphRepository graphRepository,
            SemanticEdgeRepository semanticEdgeRepository,
            SpatialLogicService spatialLogicService,
            GraphOrchestratorService graphOrchestratorService,
            ActivityLogRepository activityLogRepository) {

        this.nodeRepository = nodeRepository;
        this.graphRepository = graphRepository;
        this.semanticEdgeRepository = semanticEdgeRepository;
        this.spatialLogicService = spatialLogicService;
        this.graphOrchestratorService = graphOrchestratorService;
        this.activityLogRepository = activityLogRepository;
    }

    /**
     * GET /api/nodes/graph/{graphId}
     *
     * Returns all concept nodes belonging to the graph.
     */
    @GetMapping("/graph/{graphId}")
    public ResponseEntity<List<ConceptNode>> getNodesByGraph(
            @PathVariable Long graphId) {

        List<ConceptNode> nodes =
                nodeRepository.findAllByGraphId(graphId);

        return ResponseEntity.ok(nodes);
    }

    /**
     * POST /api/nodes/validate-layout/{graphId}
     *
     * Triggers spatial layout validation and offset logic.
     */
    @PostMapping("/validate-layout/{graphId}")
    public ResponseEntity<String> validateLayout(
            @PathVariable Long graphId) {

        spatialLogicService.validateAndOffsetNodes(graphId);

        return ResponseEntity.ok(
                "Layout validation completed successfully."
        );
    }

    /**
     * POST /api/nodes/{graphId}
     *
     * Creates a new concept node inside a graph.
     */
    @PostMapping("/{graphId}")
    public ResponseEntity<ConceptNode> createNode(
            @PathVariable Long graphId,
            @RequestBody Map<String, Object> request) {

        System.out.println(
                "CREATE NODE REQUEST = " + request
        );

        KnowledgeGraph graph =
                graphRepository.findById(graphId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Graph not found: " + graphId
                                )
                        );

        /*
         * -------------------------------------------------------
         * READ VALUES FROM JSON REQUEST
         * -------------------------------------------------------
         */

        String label =
                request.get("label") == null
                        ? null
                        : String.valueOf(
                                request.get("label")
                        );

        String contentTypeValue =
                request.get("contentType") == null
                        ? "TEXT"
                        : String.valueOf(
                                request.get("contentType")
                        );

        String rawContent =
                request.get("rawContent") == null
                        ? ""
                        : String.valueOf(
                                request.get("rawContent")
                        );

        Object xValue =
                request.get("xCoordinate");

        Object yValue =
                request.get("yCoordinate");

        String colorHex =
                request.get("colorHex") == null
                        ? "#2563eb"
                        : String.valueOf(
                                request.get("colorHex")
                        );

        /*
         * -------------------------------------------------------
         * VALIDATE REQUIRED VALUES
         * -------------------------------------------------------
         */

        if (label == null || label.trim().isEmpty()) {

            throw new BusinessValidationException(
                    "Node label is required."
            );
        }

        if (xValue == null || yValue == null) {

            throw new BusinessValidationException(
                    "X and Y coordinates are required."
            );
        }

        /*
         * -------------------------------------------------------
         * PARSE COORDINATES
         * -------------------------------------------------------
         */

        double x;
        double y;

        try {

            x = Double.parseDouble(
                    String.valueOf(xValue)
            );

            y = Double.parseDouble(
                    String.valueOf(yValue)
            );

        } catch (NumberFormatException exception) {

            throw new BusinessValidationException(
                    "X and Y coordinates must be valid numbers."
            );
        }

        /*
         * -------------------------------------------------------
         * CREATE ENTITY
         * -------------------------------------------------------
         */

        ConceptNode node =
                new ConceptNode();

        node.setGraph(graph);

        node.setLabel(
                label.trim()
        );

        try {

            node.setContentType(
                    ConceptNode.ContentType.valueOf(
                            contentTypeValue.toUpperCase()
                    )
            );

        } catch (IllegalArgumentException exception) {

            throw new BusinessValidationException(
                    "Invalid content type."
            );
        }

        node.setRawContent(
                rawContent
        );

        node.setXCoordinate(
                x
        );

        node.setYCoordinate(
                y
        );

        node.setColorHex(
                colorHex
        );

        /*
         * -------------------------------------------------------
         * SAVE
         * -------------------------------------------------------
         */

        ConceptNode savedNode =
                nodeRepository.save(node);

        /*
         * -------------------------------------------------------
         * ACTIVITY LOG
         * -------------------------------------------------------
         */

        saveNodeActivity(
                "CREATE_NODE",
                savedNode
        );

        return ResponseEntity
                .status(201)
                .body(savedNode);
    }

    /**
     * PUT /api/nodes/{nodeId}
     *
     * Updates an existing concept node.
     */
    @PutMapping("/{nodeId}")
    @PreAuthorize(
            "hasAnyRole('KNOWLEDGE_ARCHITECT','RESEARCH_STRATEGIST')"
    )
    public ResponseEntity<ConceptNode> updateNode(
            @PathVariable Long nodeId,
            @RequestBody Map<String, Object> request) {

        System.out.println(
                "UPDATE NODE REQUEST = " + request
        );

        ConceptNode existing =
                nodeRepository.findById(nodeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Node not found: " + nodeId
                                )
                        );

        /*
         * -------------------------------------------------------
         * READ VALUES FROM JSON
         * -------------------------------------------------------
         */

        String label =
                request.get("label") == null
                        ? null
                        : String.valueOf(
                                request.get("label")
                        );

        String contentTypeValue =
                request.get("contentType") == null
                        ? null
                        : String.valueOf(
                                request.get("contentType")
                        );

        String rawContent =
                request.get("rawContent") == null
                        ? ""
                        : String.valueOf(
                                request.get("rawContent")
                        );

        Object xValue =
                request.get("xCoordinate");

        Object yValue =
                request.get("yCoordinate");

        String colorHex =
                request.get("colorHex") == null
                        ? "#2563eb"
                        : String.valueOf(
                                request.get("colorHex")
                        );

        /*
         * -------------------------------------------------------
         * VALIDATE LABEL
         * -------------------------------------------------------
         */

        if (label == null ||
                label.trim().isEmpty()) {

            throw new BusinessValidationException(
                    "Node label is required."
            );
        }

        /*
         * -------------------------------------------------------
         * VALIDATE COORDINATES
         * -------------------------------------------------------
         */

        if (xValue == null ||
                yValue == null) {

            throw new BusinessValidationException(
                    "X and Y coordinates are required."
            );
        }

        double x;
        double y;

        try {

            x = Double.parseDouble(
                    String.valueOf(xValue)
            );

            y = Double.parseDouble(
                    String.valueOf(yValue)
            );

        } catch (NumberFormatException exception) {

            throw new BusinessValidationException(
                    "X and Y coordinates must be valid numbers."
            );
        }

        /*
         * -------------------------------------------------------
         * VALIDATE CONTENT TYPE
         * -------------------------------------------------------
         */

        ConceptNode.ContentType contentType;

        try {

            contentType =
                    ConceptNode.ContentType.valueOf(
                            (
                                    contentTypeValue == null
                                            ? "TEXT"
                                            : contentTypeValue
                            ).toUpperCase()
                    );

        } catch (IllegalArgumentException exception) {

            throw new BusinessValidationException(
                    "Invalid content type."
            );
        }

        /*
         * -------------------------------------------------------
         * VALIDATE COLOR
         * -------------------------------------------------------
         */

        if (!colorHex.matches(
                "^#[0-9A-Fa-f]{6}$"
        )) {

            throw new BusinessValidationException(
                    "Color must be a valid hexadecimal color."
            );
        }

        /*
         * -------------------------------------------------------
         * UPDATE ENTITY
         * -------------------------------------------------------
         */

        existing.setLabel(
                label.trim()
        );

        existing.setContentType(
                contentType
        );

        existing.setRawContent(
                rawContent
        );

        existing.setXCoordinate(
                x
        );

        existing.setYCoordinate(
                y
        );

        existing.setColorHex(
                colorHex
        );

        /*
         * -------------------------------------------------------
         * SAVE
         * -------------------------------------------------------
         */

        ConceptNode savedNode =
                nodeRepository.save(
                        existing
                );

        /*
         * -------------------------------------------------------
         * ACTIVITY LOG
         * -------------------------------------------------------
         */

        saveNodeActivity(
                "UPDATE_NODE",
                savedNode
        );

        return ResponseEntity.ok(
                savedNode
        );
    }

    /**
     * DELETE /api/nodes/{nodeId}
     *
     * Deletes a node and all semantic edges
     * connected to it.
     */
    @DeleteMapping("/{nodeId}")
    @PreAuthorize(
            "hasAnyRole('KNOWLEDGE_ARCHITECT','RESEARCH_STRATEGIST')"
    )
    public ResponseEntity<Void> deleteNode(
            @PathVariable Long nodeId) {

        ConceptNode existing =
                nodeRepository.findById(nodeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Node not found: " + nodeId
                                )
                        );

        Long graphId =
                existing.getGraph().getId();

        List<SemanticEdge> relatedEdges =
                semanticEdgeRepository
                        .findAllBySourceNodeIdOrTargetNodeId(
                                nodeId,
                                nodeId
                        );

        if (!relatedEdges.isEmpty()) {

            semanticEdgeRepository.deleteAll(
                    relatedEdges
            );
        }

        /*
         * -------------------------------------------------------
         * ACTIVITY LOG
         * -------------------------------------------------------
         *
         * Save before deleting the node so the node label
         * and graph relationship are still available.
         */

        saveNodeActivity(
                "DELETE_NODE",
                existing
        );

        /*
         * -------------------------------------------------------
         * DELETE NODE
         * -------------------------------------------------------
         */

        nodeRepository.delete(existing);

        /*
         * -------------------------------------------------------
         * RECALCULATE COMPLEXITY
         * -------------------------------------------------------
         */

        graphOrchestratorService
                .calculateComplexity(graphId);

        return ResponseEntity
                .noContent()
                .build();
    }

    /**
     * PUT /api/nodes/{nodeId}/position
     *
     * Updates only the X and Y coordinates of a node.
     *
     * NOTE:
     * Position changes are intentionally NOT added
     * to ActivityLog to avoid flooding the activity log
     * during node dragging.
     */
    @PutMapping("/{nodeId}/position")
    @PreAuthorize(
            "hasAnyRole('KNOWLEDGE_ARCHITECT','RESEARCH_STRATEGIST')"
    )
    public ResponseEntity<ConceptNode> updateNodePosition(
            @PathVariable Long nodeId,
            @RequestBody Map<String, Object> request) {

        ConceptNode node =
                nodeRepository.findById(nodeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Node not found: " + nodeId
                                )
                        );

        Object xValue =
                request.get("xCoordinate");

        Object yValue =
                request.get("yCoordinate");

        if (xValue == null ||
                yValue == null) {

            throw new BusinessValidationException(
                    "X and Y coordinates are required."
            );
        }

        double x;
        double y;

        try {

            x = Double.parseDouble(
                    String.valueOf(xValue)
            );

            y = Double.parseDouble(
                    String.valueOf(yValue)
            );

        } catch (NumberFormatException exception) {

            throw new BusinessValidationException(
                    "X and Y coordinates must be valid numbers."
            );
        }

        node.setXCoordinate(x);
        node.setYCoordinate(y);

        return ResponseEntity.ok(
                nodeRepository.save(node)
        );
    }

    /**
     * Saves an activity record for node actions.
     */
    private void saveNodeActivity(
            String activityType,
            ConceptNode node) {

        if (node == null ||
                node.getGraph() == null ||
                node.getGraph().getOwner() == null ||
                node.getGraph().getOwner().getId() == null) {

            return;
        }

        ActivityLog activityLog =
                new ActivityLog();

        activityLog.setType(
                activityType
        );

        activityLog.setTargetTitle(
                node.getLabel()
        );

        activityLog.setOwnerId(
                node.getGraph()
                        .getOwner()
                        .getId()
        );

        activityLogRepository.save(
                activityLog
        );
    }
}