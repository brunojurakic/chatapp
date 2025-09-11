package com.flow.backend.dto;

import java.time.Instant;
import java.util.UUID;

public class ActivityLogDTO {
  private UUID id;
  private UUID userId;
  private String userName;
  private String userEmail;
  private String action;
  private String description;
  private String ipAddress;
  private Instant createdAt;

  public ActivityLogDTO() {}

  public ActivityLogDTO(
      UUID id,
      UUID userId,
      String userName,
      String userEmail,
      String action,
      String description,
      String ipAddress,
      Instant createdAt) {
    this.id = id;
    this.userId = userId;
    this.userName = userName;
    this.userEmail = userEmail;
    this.action = action;
    this.description = description;
    this.ipAddress = ipAddress;
    this.createdAt = createdAt;
  }

  // Getters and setters
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public String getUserName() {
    return userName;
  }

  public void setUserName(String userName) {
    this.userName = userName;
  }

  public String getUserEmail() {
    return userEmail;
  }

  public void setUserEmail(String userEmail) {
    this.userEmail = userEmail;
  }

  public String getAction() {
    return action;
  }

  public void setAction(String action) {
    this.action = action;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getIpAddress() {
    return ipAddress;
  }

  public void setIpAddress(String ipAddress) {
    this.ipAddress = ipAddress;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
