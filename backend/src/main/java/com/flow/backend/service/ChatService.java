package com.flow.backend.service;

import com.flow.backend.dto.ChatMessageDTO;
import com.flow.backend.model.ChatMessage;
import com.flow.backend.model.Friendship;
import com.flow.backend.model.User;
import com.flow.backend.repository.ChatMessageRepository;
import com.flow.backend.repository.FriendshipRepository;
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

  public List<ChatMessageDTO> getRecentMessages(UUID friendshipId, int limit) {
    Optional<Friendship> fOpt = friendshipRepository.findById(friendshipId);
    if (fOpt.isEmpty()) throw new IllegalArgumentException("Conversation not found");
    Friendship f = fOpt.get();
    var msgs = chatMessageRepository.findByFriendship(f, PageRequest.of(0, limit));
    return msgs.stream()
        .map(
            m ->
                new ChatMessageDTO(
                    m.getId(),
                    f.getId(),
                    m.getSender().getId(),
                    m.getSender().getDisplayName() != null
                        ? m.getSender().getDisplayName()
                        : m.getSender().getName(),
                    m.getSender().getProfilePictureUrl(),
                    m.getContent(),
                    m.getCreatedAt()))
        .collect(Collectors.toList());
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
    return new ChatMessageDTO(
        saved.getId(),
        f.getId(),
        saved.getSender().getId(),
        saved.getSender().getDisplayName() != null
            ? saved.getSender().getDisplayName()
            : saved.getSender().getName(),
        saved.getSender().getProfilePictureUrl(),
        saved.getContent(),
        saved.getCreatedAt());
  }
}
