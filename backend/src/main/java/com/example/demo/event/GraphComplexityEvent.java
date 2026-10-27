package com.example.demo.event;

import org.springframework.context.ApplicationEvent;

public class GraphComplexityEvent extends ApplicationEvent {

    private final Long graphId;
    private final int nodeCount;
    private final int edgeCount;

    public GraphComplexityEvent(
            Object source,
            Long graphId,
            int nodeCount,
            int edgeCount) {

        super(source);
        this.graphId = graphId;
        this.nodeCount = nodeCount;
        this.edgeCount = edgeCount;
    }

    public Long getGraphId() {
        return graphId;
    }

    public int getNodeCount() {
        return nodeCount;
    }

    public int getEdgeCount() {
        return edgeCount;
    }
}