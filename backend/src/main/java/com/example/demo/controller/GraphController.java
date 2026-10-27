package com.example.demo.controller;

import com.example.demo.entity.ActivityLog;
import com.example.demo.entity.KnowledgeGraph;
import com.example.demo.repository.ActivityLogRepository;
import com.example.demo.repository.KnowledgeGraphRepository;
import com.example.demo.service.GraphOrchestratorService;
import com.example.demo.service.GraphAnalysisService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/graphs")
public class GraphController {

    private final GraphOrchestratorService graphOrchestratorService;
    private final KnowledgeGraphRepository graphRepository;
    private final GraphAnalysisService graphAnalysisService;
    private final ActivityLogRepository activityLogRepository;

    @Autowired
    public GraphController(
            GraphOrchestratorService graphOrchestratorService,
            KnowledgeGraphRepository graphRepository,
            GraphAnalysisService graphAnalysisService,
            ActivityLogRepository activityLogRepository) {

        this.graphOrchestratorService =
                graphOrchestratorService;

        this.graphRepository =
                graphRepository;

        this.graphAnalysisService =
                graphAnalysisService;

        this.activityLogRepository =
                activityLogRepository;
    }

    /**
     * GET /api/graphs
     *
     * Returns all knowledge graphs.
     */
    @GetMapping
    public ResponseEntity<List<KnowledgeGraph>> getAllGraphs() {

        List<KnowledgeGraph> graphs =
                graphOrchestratorService.getAllGraphs();

        return ResponseEntity.ok(graphs);
    }

    /**
     * GET /api/graphs/search?query=value
     *
     * Searches the graph title and description.
     */
    @GetMapping("/search")
    public ResponseEntity<List<KnowledgeGraph>> searchGraphs(
            @RequestParam String query) {

        List<KnowledgeGraph> graphs =
                graphRepository
                        .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                                query,
                                query
                        );

        return ResponseEntity.ok(graphs);
    }

    /**
     * GET /api/graphs/public
     *
     * Returns public knowledge graphs.
     */
    @GetMapping("/public")
    public ResponseEntity<List<KnowledgeGraph>> getPublicGraphs() {

        List<KnowledgeGraph> graphs =
                graphOrchestratorService.getAllGraphs();

        return ResponseEntity.ok(graphs);
    }

    /**
     * GET /api/graphs/my?ownerId=1
     *
     * Returns graphs belonging to a particular owner.
     */
    @GetMapping("/my")
    public ResponseEntity<Page<KnowledgeGraph>> getMyGraphs(
            @RequestParam Long ownerId,
            Pageable pageable) {

        Page<KnowledgeGraph> ownerGraphs =
                graphRepository.findAllByOwnerId(
                        ownerId,
                        pageable
                );

        return ResponseEntity.ok(ownerGraphs);
    }

    /**
     * GET /api/graphs/{id}
     *
     * Returns a knowledge graph using its ID.
     *
     * IMPORTANT:
     * This method is kept unchanged so the existing
     * validation tests continue to work exactly as before.
     */
    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeGraph> getGraphById(
            @PathVariable Long id) {

        KnowledgeGraph graph =
                graphOrchestratorService.getGraphById(id);

        return ResponseEntity.ok(graph);
    }

    /**
     * POST /api/graphs/{id}/view?viewerId=1
     *
     * Automatically records a VIEW history entry
     * for the user who opened a public knowledge graph.
     *
     * This does not modify the graph.
     */
    @PostMapping("/{id}/view")
    public ResponseEntity<KnowledgeGraph> recordGraphView(
            @PathVariable Long id,
            @RequestParam Long viewerId) {

        KnowledgeGraph graph =
                graphOrchestratorService.getGraphById(id);

        saveViewActivity(
                graph,
                viewerId
        );

        return ResponseEntity.ok(graph);
    }

    /**
     * POST /api/graphs
     *
     * Creates a new knowledge graph.
     */
    @PostMapping
    @PreAuthorize(
            "hasAnyRole(" +
                    "'KNOWLEDGE_ARCHITECT'," +
                    "'RESEARCH_STRATEGIST'" +
                    ")"
    )
    public ResponseEntity<KnowledgeGraph> createGraph(
            @Valid
            @RequestBody
            KnowledgeGraph graph) {

        KnowledgeGraph createdGraph =
                graphOrchestratorService.createGraph(graph);

        saveActivity(
                "CREATE",
                createdGraph
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdGraph);
    }

    /**
     * PUT /api/graphs/{id}
     *
     * Updates an existing graph.
     */
    @PutMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole(" +
                    "'KNOWLEDGE_ARCHITECT'," +
                    "'RESEARCH_STRATEGIST'" +
                    ")"
    )
    public ResponseEntity<KnowledgeGraph> updateGraph(
            @PathVariable Long id,
            @Valid
            @RequestBody
            KnowledgeGraph graph) {

        KnowledgeGraph updatedGraph =
                graphOrchestratorService.updateGraph(
                        id,
                        graph
                );

        saveActivity(
                "UPDATE",
                updatedGraph
        );

        return ResponseEntity.ok(updatedGraph);
    }

    /**
     * DELETE /api/graphs/{id}
     *
     * Deletes a knowledge graph.
     *
     * Response text:
     * KnowledgeGraph deleted successfully.
     *
     * IMPORTANT:
     * Keep this service delegation unchanged
     * for the existing validation tests.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize(
            "hasRole('KNOWLEDGE_ARCHITECT')"
    )
    public ResponseEntity<String> deleteGraph(
            @PathVariable Long id) {

        graphOrchestratorService.deleteGraph(id);

        return ResponseEntity.ok(
                "KnowledgeGraph deleted successfully."
        );
    }

    /**
     * POST /api/graphs/{id}/calculate-complexity
     *
     * Calculates and updates graph complexity.
     */
    @PostMapping("/{id}/calculate-complexity")
    @PreAuthorize(
            "hasAnyRole(" +
                    "'KNOWLEDGE_ARCHITECT'," +
                    "'RESEARCH_STRATEGIST'" +
                    ")"
    )
    public ResponseEntity<KnowledgeGraph> calculateComplexity(
            @PathVariable Long id) {

        KnowledgeGraph graph =
                graphOrchestratorService.calculateComplexity(id);

        return ResponseEntity.ok(graph);
    }

    /**
     * GET /api/graphs/activity?ownerId=1
     *
     * Returns activity logs belonging to a user.
     */
    @GetMapping("/activity")
    public ResponseEntity<List<ActivityLog>> getActivity(
            @RequestParam Long ownerId) {

        List<ActivityLog> activityLogs =
                activityLogRepository
                        .findAllByOwnerIdOrderByTimestampDesc(
                                ownerId
                        );

        return ResponseEntity.ok(activityLogs);
    }

    /**
     * GET /api/graphs/activity/all
     *
     * Returns every platform activity.
     */
    @GetMapping("/activity/all")
    @PreAuthorize(
            "hasRole('KNOWLEDGE_ARCHITECT')"
    )
    public ResponseEntity<List<ActivityLog>> getAllActivity() {

        List<ActivityLog> activityLogs =
                activityLogRepository.findAll();

        return ResponseEntity.ok(activityLogs);
    }

    /**
     * GET /api/graphs/{id}/analysis
     *
     * Performs analysis on a knowledge graph.
     */
    @GetMapping("/{id}/analysis")
    public ResponseEntity<Map<String, Object>> analyzeGraph(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                graphAnalysisService.analyzeGraph(id)
        );
    }

    /**
     * Saves CREATE and UPDATE activity logs
     * using the graph owner.
     */
    private void saveActivity(
            String activityType,
            KnowledgeGraph graph) {

        if (graph == null ||
                graph.getOwner() == null ||
                graph.getOwner().getId() == null) {

            return;
        }

        ActivityLog activityLog =
                new ActivityLog();

        activityLog.setType(
                activityType
        );

        activityLog.setTargetTitle(
                graph.getTitle()
        );

        activityLog.setOwnerId(
                graph.getOwner().getId()
        );

        activityLogRepository.save(
                activityLog
        );
    }

    /**
     * Saves VIEW activity using the actual
     * user who viewed the graph.
     */
    private void saveViewActivity(
            KnowledgeGraph graph,
            Long viewerId) {

        if (graph == null ||
                viewerId == null) {

            return;
        }

        ActivityLog activityLog =
                new ActivityLog();

        activityLog.setType(
                "VIEW"
        );

        activityLog.setTargetTitle(
                graph.getTitle()
        );

        activityLog.setOwnerId(
                viewerId
        );

        activityLogRepository.save(
                activityLog
        );
    }
}