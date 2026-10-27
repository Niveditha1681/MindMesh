package com.example.demo.dto;

import com.example.demo.entity.CollaborationInvite.InviteStatus;

public class InviteResponseDto {

    private Long inviteId;
    private InviteStatus status;

    public Long getInviteId() {
        return inviteId;
    }

    public void setInviteId(Long inviteId) {
        this.inviteId = inviteId;
    }

    public InviteStatus getStatus() {
        return status;
    }

    public void setStatus(InviteStatus status) {
        this.status = status;
    }
}