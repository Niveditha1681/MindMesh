package com.example.demo.service;

import com.example.demo.entity.ConceptNode;
import com.example.demo.entity.SemanticEdge;
import com.example.demo.repository.ConceptNodeRepository;
import com.example.demo.repository.SemanticEdgeRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GraphAnalysisService {

    private final ConceptNodeRepository nodeRepository;
    private final SemanticEdgeRepository edgeRepository;

    public GraphAnalysisService(
            ConceptNodeRepository nodeRepository,
            SemanticEdgeRepository edgeRepository) {

        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
    }

    public Map<String, Object> analyzeGraph(Long graphId) {

        List<ConceptNode> nodes =
                nodeRepository.findAllByGraphId(graphId);

        List<SemanticEdge> edges =
                edgeRepository.findAllByGraphId(graphId);

        int nodeCount = nodes.size();
        int edgeCount = edges.size();

        Set<Long> connectedNodeIds = new HashSet<>();

        for (SemanticEdge edge : edges) {

            if (edge.getSourceNode() != null &&
                    edge.getSourceNode().getId() != null) {

                connectedNodeIds.add(
                        edge.getSourceNode().getId()
                );
            }

            if (edge.getTargetNode() != null &&
                    edge.getTargetNode().getId() != null) {

                connectedNodeIds.add(
                        edge.getTargetNode().getId()
                );
            }
        }

        List<ConceptNode> disconnectedNodes =
                nodes.stream()
                        .filter(node ->
                                node.getId() != null &&
                                !connectedNodeIds.contains(
                                        node.getId()
                                )
                        )
                        .collect(Collectors.toList());

        int connectedNodeCount =
                connectedNodeIds.size();

        int disconnectedNodeCount =
                disconnectedNodes.size();

        double complexityScore =
                (edgeCount * 2.0) /
                Math.max(nodeCount, 1);

        double density = 0.0;

        if (nodeCount > 1) {

            double possibleEdges =
                    (double) nodeCount *
                    (nodeCount - 1) /
                    2.0;

            density =
                    possibleEdges > 0
                            ? edgeCount / possibleEdges
                            : 0.0;
        }

        List<Map<String, Object>> disconnected =
                disconnectedNodes.stream()
                        .map(node -> {

                            Map<String, Object> item =
                                    new LinkedHashMap<>();

                            item.put(
                                    "id",
                                    node.getId()
                            );

                            item.put(
                                    "label",
                                    node.getLabel()
                            );

                            item.put(
                                    "contentType",
                                    node.getContentType()
                            );

                            return item;
                        })
                        .toList();

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put("graphId", graphId);
        result.put("nodeCount", nodeCount);
        result.put("edgeCount", edgeCount);
        result.put(
                "connectedNodeCount",
                connectedNodeCount
        );
        result.put(
                "disconnectedNodeCount",
                disconnectedNodeCount
        );
        result.put(
                "complexityScore",
                Math.round(complexityScore * 100.0) / 100.0
        );
        result.put(
                "density",
                Math.round(density * 100.0) / 100.0
        );
        result.put(
                "disconnectedNodes",
                disconnected
        );

        return result;
    }
}