package com.flow.backend.controller;

import com.flow.backend.service.UserService;
import com.flow.backend.util.AuthUtil;
import com.flow.backend.util.UserDisplayUtil;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class PublicUserController {

  @Autowired private AuthUtil authUtil;

  @Autowired private UserService userService;

  @Autowired private com.flow.backend.service.FriendService friendService;

  @Autowired private UserDisplayUtil userDisplayUtil;

  private String extractEmail(String authHeader) {
    try {
      return authUtil.extractEmailFromToken(authHeader);
    } catch (SecurityException e) {
      return null;
    }
  }

  @GetMapping("/search")
  public ResponseEntity<?> searchUsers(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @RequestParam(value = "query", required = false) String q) {
    try {
      String email = extractEmail(authHeader);
      if (email == null)
        return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
      var list = userService.searchUsers(q);
      return ResponseEntity.ok(
          list.stream()
              .filter(u -> u.getEmail() == null || !u.getEmail().equalsIgnoreCase(email))
              .map(
                  u -> {
                    var me = userService.findByEmail(email).orElse(null);
                    var pending = friendService.hasPendingRequest(me, u);
                    var incomingOpt = friendService.getPendingRequestBetween(u, me);
                    if (incomingOpt.isPresent()) {
                      var req = incomingOpt.get();
                      return Map.of(
                          "id",
                          u.getId(),
                          "name",
                          userDisplayUtil.getDisplayName(u),
                          "username",
                          u.getUsername(),
                          "pendingRequest",
                          pending,
                          "incomingRequest",
                          true,
                          "incomingRequestId",
                          req.getId());
                    }
                    return Map.of(
                        "id",
                        u.getId(),
                        "name",
                        userDisplayUtil.getDisplayName(u),
                        "username",
                        u.getUsername(),
                        "pendingRequest",
                        pending,
                        "incomingRequest",
                        false);
                  })
              .collect(Collectors.toList()));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }
}
