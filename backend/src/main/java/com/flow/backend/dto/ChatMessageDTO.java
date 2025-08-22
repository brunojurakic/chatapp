package com.flow.backend.dto;

import java.time.Instant;
import java.util.UUID;

public class ChatMessageDTO {
  private UUID id;
  private UUID friendshipId;
  private UUID senderId;
  private String senderName;
  private String senderPicture;
  private String content;
  private Instant createdAt;

  public ChatMessageDTO() {}

  public ChatMessageDTO(
      UUID id,
      UUID friendshipId,
      UUID senderId,
      String senderName,
      String senderPicture,
      String content,
      Instant createdAt) {
    this.id = id;
    this.friendshipId = friendshipId;
    this.senderId = senderId;
    this.senderName = senderName;
    this.senderPicture = senderPicture;
    this.content = content;
    this.createdAt = createdAt;
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getFriendshipId() {
    return friendshipId;
  }

  public void setFriendshipId(UUID friendshipId) {
    this.friendshipId = friendshipId;
  }

  public UUID getSenderId() {
    return senderId;
  }

  public void setSenderId(UUID senderId) {
    this.senderId = senderId;
  }

  public String getSenderName() {
    return senderName;
  }

  public void setSenderName(String senderName) {
    this.senderName = senderName;
  }

  public String getSenderPicture() {
    return senderPicture;
  }

  public void setSenderPicture(String senderPicture) {
    this.senderPicture = senderPicture;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
