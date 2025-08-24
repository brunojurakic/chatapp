package com.flow.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "friendship_id", nullable = false)
  private Friendship friendship;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "sender_id", nullable = false)
  private User sender;

  @Column(name = "content", nullable = false, length = 2000)
  private String content;

  @Column(name = "attachment_url")
  private String attachmentUrl;

  @Column(name = "attachment_type")
  private String attachmentType;

  @Column(name = "attachment_name")
  private String attachmentName;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = Instant.now();
  }

  public ChatMessage() {}

  public ChatMessage(Friendship friendship, User sender, String content) {
    this.friendship = friendship;
    this.sender = sender;
    this.content = content;
  }

  public ChatMessage(
      Friendship friendship,
      User sender,
      String content,
      String attachmentUrl,
      String attachmentType,
      String attachmentName) {
    this.friendship = friendship;
    this.sender = sender;
    this.content = content;
    this.attachmentUrl = attachmentUrl;
    this.attachmentType = attachmentType;
    this.attachmentName = attachmentName;
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public Friendship getFriendship() {
    return friendship;
  }

  public void setFriendship(Friendship friendship) {
    this.friendship = friendship;
  }

  public User getSender() {
    return sender;
  }

  public void setSender(User sender) {
    this.sender = sender;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public String getAttachmentUrl() {
    return attachmentUrl;
  }

  public void setAttachmentUrl(String attachmentUrl) {
    this.attachmentUrl = attachmentUrl;
  }

  public String getAttachmentType() {
    return attachmentType;
  }

  public void setAttachmentType(String attachmentType) {
    this.attachmentType = attachmentType;
  }

  public String getAttachmentName() {
    return attachmentName;
  }

  public void setAttachmentName(String attachmentName) {
    this.attachmentName = attachmentName;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
