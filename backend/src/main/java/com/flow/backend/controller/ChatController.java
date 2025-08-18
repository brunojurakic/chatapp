package com.flow.backend.controller;

import com.flow.backend.model.User;
import com.flow.backend.service.ChatService;
import com.flow.backend.service.UserService;
import com.flow.backend.util.JwtUtil;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

  @Autowired private JwtUtil jwtUtil;

  @Autowired private UserService userService;

  @Autowired private ChatService chatService;

  @Autowired private com.flow.backend.service.FriendService friendService;

  private User getCurrentUserFromToken(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
    String token = authHeader.substring(7);
    if (!jwtUtil.validateToken(token)) return null;
    String email = jwtUtil.extractUsername(token);
    return userService.findByEmail(email).orElse(null);
  }

  @PostMapping("/start")
  public ResponseEntity<?> startConversation(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @RequestParam("friendUserId") UUID friendUserId) {
    try {
      User me = getCurrentUserFromToken(authHeader);
      if (me == null) return ResponseEntity.status(401).body("Not authenticated");
      chatService.getRecentMessages(friendUserId, 1);
      return ResponseEntity.ok(Map.of("conversationId", friendUserId));
    } catch (IllegalArgumentException ia) {
      return ResponseEntity.badRequest().body(Map.of("error", ia.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/{friendshipId}/messages")
  public ResponseEntity<?> getMessages(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @PathVariable("friendshipId") UUID friendshipId,
      @RequestParam(value = "limit", required = false, defaultValue = "50") int limit) {
    try {
      User me = getCurrentUserFromToken(authHeader);
      if (me == null) return ResponseEntity.status(401).body("Not authenticated");
      var msgs = chatService.getRecentMessages(friendshipId, limit);
      return ResponseEntity.ok(msgs);
    } catch (IllegalArgumentException ia) {
      return ResponseEntity.badRequest().body(Map.of("error", ia.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/with/{friendUserId}")
  public ResponseEntity<?> getConversationWith(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @PathVariable("friendUserId") UUID friendUserId) {
    try {
      User me = getCurrentUserFromToken(authHeader);
      if (me == null) return ResponseEntity.status(401).body("Not authenticated");
      var maybe = friendService.getFriendshipIdBetween(me, friendUserId);
      if (maybe.isEmpty())
        return ResponseEntity.status(404).body(Map.of("error", "Friendship not found"));
      return ResponseEntity.ok(Map.of("conversationId", maybe.get()));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }
}
