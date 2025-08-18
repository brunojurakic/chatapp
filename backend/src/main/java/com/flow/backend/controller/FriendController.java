package com.flow.backend.controller;

import com.flow.backend.dto.FriendRequestDTO;
import com.flow.backend.model.User;
import com.flow.backend.service.FriendService;
import com.flow.backend.service.UserService;
import com.flow.backend.util.JwtUtil;
import java.util.List;
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
@RequestMapping("/api/friends")
public class FriendController {

  @Autowired private JwtUtil jwtUtil;

  @Autowired private UserService userService;

  @Autowired private FriendService friendService;

  private User getCurrentUserFromToken(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
    String token = authHeader.substring(7);
    if (!jwtUtil.validateToken(token)) return null;
    String email = jwtUtil.extractUsername(token);
    return userService.findByEmail(email).orElse(null);
  }

  @GetMapping("/requests")
  public ResponseEntity<?> incomingRequests(
      @RequestHeader(value = "Authorization", required = false) String authHeader) {
    try {
      User me = getCurrentUserFromToken(authHeader);
      if (me == null) return ResponseEntity.status(401).body("Not authenticated");
      List<FriendRequestDTO> list = friendService.getIncomingRequests(me);
      return ResponseEntity.ok(list);
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/outgoing")
  public ResponseEntity<?> outgoingRequests(
      @RequestHeader(value = "Authorization", required = false) String authHeader) {
    try {
      User me = getCurrentUserFromToken(authHeader);
      if (me == null) return ResponseEntity.status(401).body("Not authenticated");
      var list = friendService.getOutgoingRequests(me);
      return ResponseEntity.ok(list);
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("")
  public ResponseEntity<?> listFriends(
      @RequestHeader(value = "Authorization", required = false) String authHeader) {
    try {
      User me = getCurrentUserFromToken(authHeader);
      if (me == null) return ResponseEntity.status(401).body("Not authenticated");
      List<User> friends = friendService.getFriends(me);
      return ResponseEntity.ok(
          friends.stream()
              .map(
                  u ->
                      Map.of(
                          "id", u.getId(),
                          "name", u.getDisplayName() != null ? u.getDisplayName() : u.getName(),
                          "username", u.getUsername(),
                          "picture", u.getProfilePictureUrl())));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/request")
  public ResponseEntity<?> sendRequest(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @RequestParam("username") String username) {
    try {
      User me = getCurrentUserFromToken(authHeader);
      if (me == null) return ResponseEntity.status(401).body("Not authenticated");
      var recipientOpt = userService.findByUsername(username);
      if (recipientOpt.isEmpty()) return ResponseEntity.status(404).body("User not found");
      User recipient = recipientOpt.get();
      friendService.sendRequest(me, recipient);
      return ResponseEntity.ok(Map.of("status", "sent"));
    } catch (IllegalArgumentException ia) {
      return ResponseEntity.badRequest().body(Map.of("error", ia.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/requests/{id}/accept")
  public ResponseEntity<?> accept(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @PathVariable("id") UUID id) {
    try {
      User me = getCurrentUserFromToken(authHeader);
      if (me == null) return ResponseEntity.status(401).body("Not authenticated");
      friendService.acceptRequest(id, me);
      return ResponseEntity.ok(Map.of("status", "accepted"));
    } catch (IllegalArgumentException ia) {
      return ResponseEntity.badRequest().body(Map.of("error", ia.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/requests/{id}/reject")
  public ResponseEntity<?> reject(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @PathVariable("id") UUID id) {
    try {
      User me = getCurrentUserFromToken(authHeader);
      if (me == null) return ResponseEntity.status(401).body("Not authenticated");
      friendService.rejectRequest(id, me);
      return ResponseEntity.ok(Map.of("status", "rejected"));
    } catch (IllegalArgumentException ia) {
      return ResponseEntity.badRequest().body(Map.of("error", ia.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }

  @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
  public ResponseEntity<?> removeFriend(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @PathVariable("id") UUID id) {
    try {
      User me = getCurrentUserFromToken(authHeader);
      if (me == null) return ResponseEntity.status(401).body("Not authenticated");
      friendService.removeFriend(me, id);
      return ResponseEntity.ok(Map.of("status", "removed"));
    } catch (IllegalArgumentException ia) {
      return ResponseEntity.badRequest().body(Map.of("error", ia.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }
}
