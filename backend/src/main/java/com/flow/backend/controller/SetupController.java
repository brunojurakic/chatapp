package com.flow.backend.controller;

import com.flow.backend.dto.UserDTO;
import com.flow.backend.model.User;
import com.flow.backend.service.RoleService;
import com.flow.backend.service.UserService;
import com.flow.backend.util.AuthUtil;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/setup")
public class SetupController {

  @Autowired private UserService userService;

  @Autowired private RoleService roleService;

  @Autowired private AuthUtil authUtil;

  @PostMapping
  public ResponseEntity<?> setupUser(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @RequestBody Map<String, String> body) {
    try {
      String email = authUtil.extractEmailFromToken(authHeader);
      String username = body.get("username");
      String displayName = body.get("displayName");

      User currentUser = userService.findByEmail(email).orElse(null);

      if (username == null || username.length() < 3) {
        return ResponseEntity.badRequest().body("Username must be at least 3 characters");
      }

      username = username.trim();
      if (username.startsWith("@")) username = username.substring(1);
      username = username.toLowerCase();

      if (currentUser != null
          && currentUser.getUsername() != null
          && currentUser.getDisplayName() != null) {
        return ResponseEntity.status(409).body("User is already set up");
      }

      if (currentUser == null
          || currentUser.getUsername() == null
          || !currentUser.getUsername().equals(username)) {
        if (userService.isUsernameTaken(username)) {
          return ResponseEntity.status(409).body("Username already taken");
        }
      }

      User updated = userService.setUsernameAndDisplayName(email, username, displayName);

      UserDTO userDTO =
          new UserDTO(
              updated.getId().toString(),
              updated.getDisplayName(),
              updated.getEmail(),
              updated.getProfilePictureUrl(),
              true,
              updated.getUsername(),
              updated.getDisplayName(),
              updated.getThemePreference(),
              roleService.getUserRoles(updated));

      return ResponseEntity.ok(userDTO);
    } catch (SecurityException e) {
      return ResponseEntity.status(401).body(e.getMessage());
    } catch (IllegalArgumentException iae) {
      return ResponseEntity.status(404).body(iae.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
    }
  }
}
