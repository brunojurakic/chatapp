package com.flow.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class OutgoingRequestDTO {
  private UUID id;
  private UUID recipientId;
  private String recipientName;
  private String recipientUsername;
  private String recipientPicture;
  private String status;
  private LocalDateTime createdAt;

  public OutgoingRequestDTO() {}

  public OutgoingRequestDTO(
      UUID id,
      UUID recipientId,
      String recipientName,
      String recipientUsername,
      String recipientPicture,
      String status,
      LocalDateTime createdAt) {
    this.id = id;
    this.recipientId = recipientId;
    this.recipientName = recipientName;
    this.recipientUsername = recipientUsername;
    this.recipientPicture = recipientPicture;
    this.status = status;
    this.createdAt = createdAt;
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getRecipientId() {
    return recipientId;
  }

  public void setRecipientId(UUID recipientId) {
    this.recipientId = recipientId;
  }

  public String getRecipientName() {
    return recipientName;
  }

  public void setRecipientName(String recipientName) {
    this.recipientName = recipientName;
  }

  public String getRecipientUsername() {
    return recipientUsername;
  }

  public void setRecipientUsername(String recipientUsername) {
    this.recipientUsername = recipientUsername;
  }

  public String getRecipientPicture() {
    return recipientPicture;
  }

  public void setRecipientPicture(String recipientPicture) {
    this.recipientPicture = recipientPicture;
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
