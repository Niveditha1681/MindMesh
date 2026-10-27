package com.example.demo.service;

import com.example.demo.entity.CollaborationInvite;
import com.example.demo.entity.CollaborationInvite.InviteStatus;
import com.example.demo.repository.CollaborationInviteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CollaborationService {

    private final CollaborationInviteRepository inviteRepository;

    @Autowired
    public CollaborationService(CollaborationInviteRepository inviteRepository) {
        this.inviteRepository = inviteRepository;
    }

    /**
     * Processes a response to a collaboration invitation.
     * Updates the invitation status and saves the changes.
     *
     * @param inviteId 
     * @param status   
     */
    @Transactional
    public void respondToInvite(Long inviteId, InviteStatus status) {

        CollaborationInvite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() ->
                        new RuntimeException("Collaboration invite not found with ID: " + inviteId));

        invite.setStatus(status);

        inviteRepository.save(invite);
    }
}