package com.flow.backend.controller;

import com.flow.backend.dto.UserDTO;
import com.flow.backend.model.User;
import com.flow.backend.service.RoleService;
import com.flow.backend.service.UserService;
import com.flow.backend.util.AuthUtil;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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
@RequestMapping("/api/admin")
public class AdminController {

  @Autowired private UserService userService;

  @Autowired private RoleService roleService;

  @Autowired private AuthUtil authUtil;

  @GetMapping("/users")
  public ResponseEntity<?> getAllUsers(
      @RequestHeader(value = "Authorization", required = false) String authHeader) {
    try {
      String email = authUtil.extractEmailFromToken(authHeader);
      User currentUser = userService.findByEmail(email).orElse(null);
      if (currentUser == null) {
        return ResponseEntity.status(404).body("User not found");
      }

      if (!roleService.getUserRoles(currentUser).contains("ADMIN")) {
        return ResponseEntity.status(403).body("Access denied. Admin role required.");
      }

      List<User> users = userService.findAll();
      List<UserDTO> userDTOs =
          users.stream()
              .map(
                  user ->
                      new UserDTO(
                          user.getDisplayName(),
                          user.getEmail(),
                          user.getProfilePictureUrl(),
                          true,
                          user.getUsername(),
                          user.getDisplayName(),
                          user.getThemePreference(),
                          roleService.getUserRoles(user)))
              .collect(Collectors.toList());

      return ResponseEntity.ok(userDTOs);
    } catch (SecurityException e) {
      return ResponseEntity.status(401).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
    }
  }

  @PostMapping("/users/{userId}/roles")
  public ResponseEntity<?> assignRoleToUser(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @PathVariable String userId,
      @RequestParam String roleName) {
    try {
      String email = authUtil.extractEmailFromToken(authHeader);
      User currentUser = userService.findByEmail(email).orElse(null);
      if (currentUser == null) {
        return ResponseEntity.status(404).body("User not found");
      }

      if (!roleService.getUserRoles(currentUser).contains("ADMIN")) {
        return ResponseEntity.status(403).body("Access denied. Admin role required.");
      }

      User targetUser = userService.findById(java.util.UUID.fromString(userId)).orElse(null);
      if (targetUser == null) {
        return ResponseEntity.status(404).body("Target user not found");
      }

      roleService.assignRoleToUser(targetUser, roleName);

      return ResponseEntity.ok(Map.of("message", "Role assigned successfully"));
    } catch (SecurityException e) {
      return ResponseEntity.status(401).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
    }
  }

  @GetMapping("/stats")
  public ResponseEntity<?> getSystemStats(
      @RequestHeader(value = "Authorization", required = false) String authHeader) {
    try {
      String email = authUtil.extractEmailFromToken(authHeader);
      User currentUser = userService.findByEmail(email).orElse(null);
      if (currentUser == null) {
        return ResponseEntity.status(404).body("User not found");
      }

      if (!roleService.getUserRoles(currentUser).contains("ADMIN")) {
        return ResponseEntity.status(403).body("Access denied. Admin role required.");
      }

      List<User> allUsers = userService.findAll();
      long totalUsers = allUsers.size();
      long adminUsers =
          allUsers.stream()
              .filter(user -> roleService.getUserRoles(user).contains("ADMIN"))
              .count();

      Map<String, Object> stats =
          Map.of(
              "totalUsers", totalUsers,
              "adminUsers", adminUsers,
              "regularUsers", totalUsers - adminUsers);

      return ResponseEntity.ok(stats);
    } catch (SecurityException e) {
      return ResponseEntity.status(401).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
    }
  }
}
