package com.example.demo.event;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class ComplexityEventListener {

    /**
     * Handles GraphComplexityEvent after the surrounding
     * transaction has been successfully committed.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleGraphComplexityEvent(GraphComplexityEvent event) {

        Long graphId = event.getGraphId();
        int nodeCount = event.getNodeCount();
        int edgeCount = event.getEdgeCount();

        // Placeholder for post-commit processing.
        // Examples:
        // - Update analytics
        // - Write audit logs
        // - Send notifications
        // - Refresh cache

        System.out.println(
                "Graph Complexity Event -> Graph ID: " + graphId +
                ", Nodes: " + nodeCount +
                ", Edges: " + edgeCount
        );
    }
}