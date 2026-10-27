package com.example.demo.service;

import com.example.demo.entity.KnowledgeGraph;
import com.example.demo.repository.KnowledgeGraphRepository;
import com.example.demo.repository.SystemAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InsightService {

    private final KnowledgeGraphRepository graphRepository;
    private final SystemAccountRepository accountRepository;

    @Autowired
    public InsightService(KnowledgeGraphRepository graphRepository,
                          SystemAccountRepository accountRepository) {
        this.graphRepository = graphRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPlatformStats() {

        Map<String, Object> stats = new HashMap<>();

        List<KnowledgeGraph> graphs = graphRepository.findAll();

        long totalGraphs = graphs.size();
        long totalUsers = accountRepository.count();
        long publicGraphs = graphRepository.countByIsPublicTrue();

        double avgComplexity = 0.0;
        long totalNodes = 0;

        for (KnowledgeGraph graph : graphs) {

            if (graph.getComplexityScore() != null) {
                avgComplexity += graph.getComplexityScore();
            }

            if (graph.getNodes() != null) {
                totalNodes += graph.getNodes().size();
            }
        }

        if (totalGraphs > 0) {
            avgComplexity /= totalGraphs;
        }

        double networkDensity = 0.0;

        if (totalGraphs > 0) {
            networkDensity = (double) totalNodes / totalGraphs;
        }

        stats.put("totalGraphs", totalGraphs);
        stats.put("totalUsers", totalUsers);
        stats.put("publicGraphs", publicGraphs);
        stats.put("avgComplexity", avgComplexity);
        stats.put("totalNodes", totalNodes);
        stats.put("networkDensity", networkDensity);

        return stats;
    }
}