package com.flow.backend.controller;

import com.flow.backend.dto.ChatMessageDTO;
import com.flow.backend.model.User;
import com.flow.backend.service.ChatService;
import com.flow.backend.service.UserService;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatStompController {

  @Autowired private SimpMessagingTemplate messagingTemplate;

  @Autowired private ChatService chatService;

  @Autowired private UserService userService;

  @MessageMapping("/chats/{friendshipId}/send")
  public void sendMessage(
      @DestinationVariable("friendshipId") UUID friendshipId, String payload, Principal principal) {
    if (principal == null) return;

    UUID senderId = null;
    if (principal instanceof com.flow.backend.config.StompPrincipal sp) {
      senderId = sp.getUserId();
    } else {
      User u = userService.findByEmail(principal.getName()).orElse(null);
      if (u != null) senderId = u.getId();
    }

    if (senderId == null) return;

    User sender = userService.findById(senderId).orElse(null);
    if (sender == null) return;

    ChatMessageDTO saved = chatService.saveMessage(friendshipId, sender, payload);

    messagingTemplate.convertAndSend("/topic/chats/" + friendshipId.toString(), saved);
  }

  @MessageMapping("/chats/{friendshipId}/typing")
  public void handleTyping(
      @DestinationVariable("friendshipId") UUID friendshipId,
      String isTyping,
      Principal principal) {
    if (principal == null) return;

    UUID senderId = null;
    if (principal instanceof com.flow.backend.config.StompPrincipal sp) {
      senderId = sp.getUserId();
    } else {
      User u = userService.findByEmail(principal.getName()).orElse(null);
      if (u != null) senderId = u.getId();
    }

    if (senderId == null) return;

    User sender = userService.findById(senderId).orElse(null);
    if (sender == null) return;

    Map<String, Object> typingEvent = new HashMap<>();
    typingEvent.put("type", "typing");
    typingEvent.put("userId", senderId.toString());
    typingEvent.put(
        "userName", sender.getDisplayName() != null ? sender.getDisplayName() : sender.getName());
    typingEvent.put("isTyping", Boolean.valueOf(isTyping));

    messagingTemplate.convertAndSend(
        "/topic/chats/" + friendshipId.toString() + "/typing", typingEvent);
  }
}
