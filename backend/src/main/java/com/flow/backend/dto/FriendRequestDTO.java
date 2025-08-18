package com.flow.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class FriendRequestDTO {
  private UUID id;
  private UUID requesterId;
  private String requesterName;
  private String requesterUsername;
  private String requesterPicture;
  private String status;
  private LocalDateTime createdAt;

  public FriendRequestDTO() {}

  public FriendRequestDTO(
      UUID id,
      UUID requesterId,
      String requesterName,
      String requesterUsername,
      String requesterPicture,
      String status,
      LocalDateTime createdAt) {
    this.id = id;
    this.requesterId = requesterId;
    this.requesterName = requesterName;
    this.requesterUsername = requesterUsername;
    this.requesterPicture = requesterPicture;
    this.status = status;
    this.createdAt = createdAt;
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getRequesterId() {
    return requesterId;
  }

  public void setRequesterId(UUID requesterId) {
    this.requesterId = requesterId;
  }

  public String getRequesterName() {
    return requesterName;
  }

  public void setRequesterName(String requesterName) {
    this.requesterName = requesterName;
  }

  public String getRequesterUsername() {
    return requesterUsername;
  }

  public void setRequesterUsername(String requesterUsername) {
    this.requesterUsername = requesterUsername;
  }

  public String getRequesterPicture() {
    return requesterPicture;
  }

  public void setRequesterPicture(String requesterPicture) {
    this.requesterPicture = requesterPicture;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }
}
