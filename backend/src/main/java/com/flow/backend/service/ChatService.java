package com.flow.backend.service;

import com.flow.backend.dto.ChatMessageDTO;
import com.flow.backend.model.ChatMessage;
import com.flow.backend.model.Friendship;
import com.flow.backend.model.User;
import com.flow.backend.repository.ChatMessageRepository;
import com.flow.backend.repository.FriendshipRepository;
import com.flow.backend.util.ChatMessageUtil;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatService {

  @Autowired private ChatMessageRepository chatMessageRepository;

  @Autowired private FriendshipRepository friendshipRepository;

  @Autowired private ChatMessageUtil chatMessageUtil;

  public List<ChatMessageDTO> getRecentMessages(UUID friendshipId, int limit) {
    Optional<Friendship> fOpt = friendshipRepository.findById(friendshipId);
    if (fOpt.isEmpty()) throw new IllegalArgumentException("Conversation not found");
    Friendship f = fOpt.get();
    var msgs = chatMessageRepository.findByFriendship(f, PageRequest.of(0, limit));
    return msgs.stream()
        .map(message -> chatMessageUtil.createChatMessageDTO(message, f))
        .collect(Collectors.toList());
  }

  public List<ChatMessageDTO> searchMessages(UUID friendshipId, String q, int limit) {
    Optional<Friendship> fOpt = friendshipRepository.findById(friendshipId);
    if (fOpt.isEmpty()) throw new IllegalArgumentException("Conversation not found");
    Friendship f = fOpt.get();
    var msgs = chatMessageRepository.searchByFriendshipAndContent(f, q, PageRequest.of(0, limit));
    return msgs.stream()
        .map(message -> chatMessageUtil.createChatMessageDTO(message, f))
        .collect(Collectors.toList());
  }

  public java.util.Map<String, Object> searchMessagesWithContext(
      UUID friendshipId,
      String q,
      int limitMatches,
      int windowBefore,
      int windowAfter,
      int fetchLimit) {
    Optional<Friendship> fOpt = friendshipRepository.findById(friendshipId);
    if (fOpt.isEmpty()) throw new IllegalArgumentException("Conversation not found");
    Friendship f = fOpt.get();

    var matches =
        chatMessageRepository.searchByFriendshipAndContent(f, q, PageRequest.of(0, limitMatches));

    var recent = chatMessageRepository.findByFriendship(f, PageRequest.of(0, fetchLimit));
    java.util.Collections.reverse(recent);

    java.util.List<java.util.UUID> matchedIds = new java.util.ArrayList<>();
    for (var m : matches) matchedIds.add(m.getId());

    java.util.Set<Integer> includeIndexes = new java.util.TreeSet<>();
    for (var match : matches) {
      int idx = -1;
      for (int i = 0; i < recent.size(); i++) {
        if (recent.get(i).getId().equals(match.getId())) {
          idx = i;
          break;
        }
      }
      if (idx == -1) continue;
      int start = Math.max(0, idx - windowBefore);
      int end = Math.min(recent.size() - 1, idx + windowAfter);
      for (int i = start; i <= end; i++) includeIndexes.add(i);
    }

    java.util.List<ChatMessageDTO> out = new java.util.ArrayList<>();
    for (int i : includeIndexes) {
      var m = recent.get(i);
      out.add(chatMessageUtil.createChatMessageDTO(m, f.getId()));
    }

    java.util.Map<String, Object> result = new java.util.HashMap<>();
    result.put("messages", out);
    result.put("matchesCount", matches.size());
    result.put("matchedIds", matchedIds);
    return result;
  }

  @Transactional
  public ChatMessageDTO saveMessage(UUID friendshipId, User sender, String content) {
    Optional<Friendship> fOpt = friendshipRepository.findById(friendshipId);
    if (fOpt.isEmpty()) throw new IllegalArgumentException("Conversation not found");
    Friendship f = fOpt.get();

    if (!f.getUserA().getId().equals(sender.getId())
        && !f.getUserB().getId().equals(sender.getId())) {
      throw new IllegalArgumentException("Not participant");
    }
    ChatMessage m = new ChatMessage(f, sender, content);
    ChatMessage saved = chatMessageRepository.save(m);
    return chatMessageUtil.createChatMessageDTO(saved, f);
  }

  @Transactional
  public ChatMessageDTO saveMessageWithAttachment(
      UUID friendshipId,
      User sender,
      String content,
      String attachmentUrl,
      String attachmentType,
      String attachmentName) {
    Optional<Friendship> fOpt = friendshipRepository.findById(friendshipId);
    if (fOpt.isEmpty()) throw new IllegalArgumentException("Conversation not found");
    Friendship f = fOpt.get();

    if (!f.getUserA().getId().equals(sender.getId())
        && !f.getUserB().getId().equals(sender.getId())) {
      throw new IllegalArgumentException("Not participant");
    }

    ChatMessage m =
        new ChatMessage(
            f,
            sender,
            content == null ? "" : content,
            attachmentUrl,
            attachmentType,
            attachmentName);
    ChatMessage saved = chatMessageRepository.save(m);
    return chatMessageUtil.createChatMessageDTO(saved, f);
  }
}
