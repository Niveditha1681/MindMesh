package com.example.demo.controller;

import com.example.demo.service.CollaborationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.dto.InviteRequestDto;
import com.example.demo.entity.CollaborationInvite;
import com.example.demo.entity.KnowledgeGraph;
import com.example.demo.entity.SystemAccount;
import com.example.demo.repository.CollaborationInviteRepository;
import com.example.demo.repository.KnowledgeGraphRepository;
import com.example.demo.repository.SystemAccountRepository;
import com.example.demo.dto.InviteResponseDto;


@RestController
@RequestMapping("/api/collab")
public class CollaborationController {

    private final CollaborationService collaborationService;
        private final CollaborationInviteRepository inviteRepository;
    private final KnowledgeGraphRepository graphRepository;
    private final SystemAccountRepository accountRepository;
    @Autowired
public CollaborationController(
        CollaborationService collaborationService,
        CollaborationInviteRepository inviteRepository,
        KnowledgeGraphRepository graphRepository,
        SystemAccountRepository accountRepository) {

    this.collaborationService = collaborationService;
    this.inviteRepository = inviteRepository;
    this.graphRepository = graphRepository;
    this.accountRepository = accountRepository;
}

    /**
     * POST /api/collab/respond
     * Accepts inviteId and status payload.
     */
@PostMapping("/respond")
public ResponseEntity<String> respondToInvite(
        @RequestBody InviteResponseDto request) {

    collaborationService.respondToInvite(
            request.getInviteId(),
            request.getStatus());

    return ResponseEntity.ok("Invitation updated successfully.");
}
    @PostMapping("/invite")
public ResponseEntity<CollaborationInvite> createInvite(
        @RequestBody InviteRequestDto request) {

    KnowledgeGraph graph = graphRepository.findById(request.getGraphId())
            .orElseThrow(() -> new RuntimeException("Graph not found"));

    SystemAccount sender = accountRepository.findById(request.getSenderId())
            .orElseThrow(() -> new RuntimeException("Sender not found"));

    SystemAccount receiver = accountRepository.findById(request.getReceiverId())
            .orElseThrow(() -> new RuntimeException("Receiver not found"));

    CollaborationInvite invite = CollaborationInvite.builder()
            .graph(graph)
            .sender(sender)
            .receiver(receiver)
            .accessLevel(request.getAccessLevel())
            .status(CollaborationInvite.InviteStatus.PENDING)
            .build();

    CollaborationInvite savedInvite = inviteRepository.save(invite);

    return ResponseEntity.ok(savedInvite);
}
}