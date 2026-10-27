package com.example.demo.service;

import com.example.demo.entity.ConceptNode;
import com.example.demo.repository.ConceptNodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SpatialLogicService {

    private static final double MIN_DISTANCE = 10.0;
    private static final double OFFSET = 15.0;

    private final ConceptNodeRepository nodeRepository;

    @Autowired
    public SpatialLogicService(ConceptNodeRepository nodeRepository) {
        this.nodeRepository = nodeRepository;
    }

    @Transactional
    public void validateAndOffsetNodes(Long graphId) {

        List<ConceptNode> nodes = nodeRepository.findAllByGraphId(graphId);

        for (int i = 0; i < nodes.size(); i++) {

            for (int j = i + 1; j < nodes.size(); j++) {

                ConceptNode first = nodes.get(i);
                ConceptNode second = nodes.get(j);

                double dx = first.getXCoordinate() - second.getXCoordinate();
                double dy = first.getYCoordinate() - second.getYCoordinate();

                double distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < MIN_DISTANCE) {

                    second.setXCoordinate(second.getXCoordinate() + OFFSET);
                    second.setYCoordinate(second.getYCoordinate() + OFFSET);

                    nodeRepository.save(second);
                }
            }
        }
    }
}