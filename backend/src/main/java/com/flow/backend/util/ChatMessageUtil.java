package com.flow.backend.util;

import com.flow.backend.dto.ChatMessageDTO;
import com.flow.backend.model.ChatMessage;
import com.flow.backend.model.Friendship;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class ChatMessageUtil {

  public ChatMessageDTO createChatMessageDTO(ChatMessage message, Friendship friendship) {
    String displayName =
        message.getSender().getDisplayName() != null
            ? message.getSender().getDisplayName()
            : message.getSender().getName();

    return new ChatMessageDTO(
        message.getId(),
        friendship.getId(),
        message.getSender().getId(),
        displayName,
        message.getSender().getProfilePictureUrl(),
        message.getContent(),
        message.getCreatedAt(),
        message.getAttachmentUrl(),
        message.getAttachmentType(),
        message.getAttachmentName());
  }

  public ChatMessageDTO createChatMessageDTO(ChatMessage message, UUID friendshipId) {
    String displayName =
        message.getSender().getDisplayName() != null
            ? message.getSender().getDisplayName()
            : message.getSender().getName();

    return new ChatMessageDTO(
        message.getId(),
        friendshipId,
        message.getSender().getId(),
        displayName,
        message.getSender().getProfilePictureUrl(),
        message.getContent(),
        message.getCreatedAt(),
        message.getAttachmentUrl(),
        message.getAttachmentType(),
        message.getAttachmentName());
  }
}
