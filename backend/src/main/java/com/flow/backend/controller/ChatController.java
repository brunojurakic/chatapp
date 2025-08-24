package com.flow.backend.controller;

import com.flow.backend.model.User;
import com.flow.backend.service.ChatService;
import com.flow.backend.service.UserService;
import com.flow.backend.util.JwtUtil;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.MessagingException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = "${FRONTEND_URL}", allowCredentials = "true")
@RequestMapping("/api/chats")
public class ChatController {

  @Autowired private JwtUtil jwtUtil;

  @Autowired private UserService userService;

  @Autowired private ChatService chatService;

  @Autowired private com.flow.backend.service.FriendService friendService;
  @Autowired private com.flow.backend.repository.FriendshipRepository friendshipRepository;
  @Autowired private com.flow.backend.service.VercelBlobService vercelBlobService;
  @Autowired private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

  @PostMapping("/{friendshipId}/upload")
  public ResponseEntity<?> uploadAndSendMessage(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @PathVariable("friendshipId") UUID friendshipId,
      @RequestPart(value = "file", required = true) MultipartFile file,
      @RequestPart(value = "content", required = false) String content) {
    try {
      User me = getCurrentUserFromToken(authHeader);
      if (me == null) return ResponseEntity.status(401).body("Not authenticated");

      String uploadedUrl = vercelBlobService.uploadFile(file, me.getId().toString());

      String attachmentType = file.getContentType();
      String attachmentName = file.getOriginalFilename();

      var dto =
          chatService.saveMessageWithAttachment(
              friendshipId,
              me,
              content == null ? "" : content,
              uploadedUrl,
              attachmentType,
              attachmentName);

      try {
        messagingTemplate.convertAndSend("/topic/chats/" + friendshipId.toString(), dto);
      } catch (MessagingException e) {
        System.err.println("Failed to broadcast uploaded message: " + e.getMessage());
      }

      return ResponseEntity.ok(dto);
    } catch (IllegalArgumentException ia) {
      return ResponseEntity.badRequest().body(Map.of("error", ia.getMessage()));
    } catch (IOException ioe) {
      return ResponseEntity.status(500).body(Map.of("error", ioe.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }

  @RequestMapping(value = "/{friendshipId}/upload", method = RequestMethod.OPTIONS)
  public ResponseEntity<?> uploadOptions() {
    return ResponseEntity.ok().build();
  }

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

  @GetMapping("/{friendshipId}/participant")
  public ResponseEntity<?> getParticipant(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @PathVariable("friendshipId") UUID friendshipId) {
    try {
      User me = getCurrentUserFromToken(authHeader);
      if (me == null) return ResponseEntity.status(401).body("Not authenticated");
      var fOpt = friendshipRepository.findById(friendshipId);
      if (fOpt.isEmpty())
        return ResponseEntity.status(404).body(Map.of("error", "Friendship not found"));
      var f = fOpt.get();
      User other = f.getUserA().getId().equals(me.getId()) ? f.getUserB() : f.getUserA();
      return ResponseEntity.ok(
          Map.of(
              "id", other.getId(),
              "username", other.getUsername(),
              "name", other.getDisplayName() != null ? other.getDisplayName() : other.getName(),
              "picture", other.getProfilePictureUrl()));
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
