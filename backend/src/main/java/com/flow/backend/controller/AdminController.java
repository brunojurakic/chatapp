package com.flow.backend.controller;

import com.flow.backend.dto.ActivityLogDTO;
import com.flow.backend.dto.UserDTO;
import com.flow.backend.model.ActivityLog;
import com.flow.backend.model.Role;
import com.flow.backend.model.User;
import com.flow.backend.service.ActivityLogService;
import com.flow.backend.service.RoleService;
import com.flow.backend.service.UserService;
import com.flow.backend.util.AuthUtil;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
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

  @Autowired private com.flow.backend.repository.ChatMessageRepository chatMessageRepository;

  @Autowired private ActivityLogService activityLogService;

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
                          user.getId().toString(),
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

      activityLogService.logActivity(
          currentUser,
          "ROLE_ASSIGN",
          "Assigned role '" + roleName + "' to user '@" + targetUser.getUsername() + "'");

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
      long totalMessages = chatMessageRepository.count();

      Map<String, Object> stats =
          Map.of(
              "totalUsers", totalUsers,
              "adminUsers", adminUsers,
              "regularUsers", totalUsers - adminUsers,
              "totalMessages", totalMessages);

      return ResponseEntity.ok(stats);
    } catch (SecurityException e) {
      return ResponseEntity.status(401).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
    }
  }

  @GetMapping("/roles")
  public ResponseEntity<?> getAllRoles(
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

      List<Role> roles = roleService.getAllRoles();
      List<Map<String, String>> roleList =
          roles.stream()
              .map(
                  role ->
                      Map.of(
                          "name",
                          role.getName(),
                          "description",
                          role.getDescription() != null ? role.getDescription() : ""))
              .collect(Collectors.toList());

      return ResponseEntity.ok(roleList);
    } catch (SecurityException e) {
      return ResponseEntity.status(401).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
    }
  }

  @DeleteMapping("/users/{userId}/roles")
  public ResponseEntity<?> removeRoleFromUser(
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

      roleService.removeRoleFromUser(targetUser, roleName);

      activityLogService.logActivity(
          currentUser,
          "ROLE_REMOVE",
          "Removed role '" + roleName + "' from user '@" + targetUser.getUsername() + "'");

      return ResponseEntity.ok(Map.of("message", "Role removed successfully"));
    } catch (SecurityException e) {
      return ResponseEntity.status(401).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
    }
  }

  @GetMapping("/message-stats")
  public ResponseEntity<?> getMessageStats(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @RequestParam(defaultValue = "30") int days) {
    try {
      String email = authUtil.extractEmailFromToken(authHeader);
      User currentUser = userService.findByEmail(email).orElse(null);
      if (currentUser == null) {
        return ResponseEntity.status(404).body("User not found");
      }

      if (!roleService.getUserRoles(currentUser).contains("ADMIN")) {
        return ResponseEntity.status(403).body("Access denied. Admin role required.");
      }

      LocalDate endDate = LocalDate.now();
      LocalDate startDate = endDate.minusDays(days);

      List<Map<String, Object>> messageStats =
          chatMessageRepository.findAll().stream()
              .filter(
                  msg -> {
                    LocalDate msgDate = msg.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate();
                    return !msgDate.isBefore(startDate) && !msgDate.isAfter(endDate);
                  })
              .collect(
                  Collectors.groupingBy(
                      msg -> msg.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate().toString(),
                      Collectors.counting()))
              .entrySet()
              .stream()
              .map(
                  entry -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("date", entry.getKey());
                    map.put("count", entry.getValue());
                    return map;
                  })
              .sorted((a, b) -> ((String) a.get("date")).compareTo((String) b.get("date")))
              .collect(Collectors.toList());

      return ResponseEntity.ok(messageStats);
    } catch (SecurityException e) {
      return ResponseEntity.status(401).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
    }
  }

  @GetMapping("/activity-logs")
  public ResponseEntity<?> getActivityLogs(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @RequestParam(defaultValue = "50") int limit,
      @RequestParam(required = false) String action,
      @RequestParam(required = false) String userId) {
    try {
      String email = authUtil.extractEmailFromToken(authHeader);
      User currentUser = userService.findByEmail(email).orElse(null);
      if (currentUser == null) {
        return ResponseEntity.status(404).body("User not found");
      }

      if (!roleService.getUserRoles(currentUser).contains("ADMIN")) {
        return ResponseEntity.status(403).body("Access denied. Admin role required.");
      }

      List<ActivityLog> logs;

      if (userId != null && !userId.isEmpty()) {
        logs = activityLogService.getActivityLogsByUser(java.util.UUID.fromString(userId), limit);
      } else if (action != null && !action.isEmpty()) {
        logs = activityLogService.getActivityLogsByAction(action, limit);
      } else {
        logs = activityLogService.getRecentActivityLogs(limit);
      }

      List<ActivityLogDTO> logDTOs =
          logs.stream()
              .map(
                  log ->
                      new ActivityLogDTO(
                          log.getId(),
                          log.getUser().getId(),
                          log.getUser().getDisplayName() != null
                              ? log.getUser().getDisplayName()
                              : log.getUser().getName(),
                          log.getUser().getEmail(),
                          log.getAction(),
                          log.getDescription(),
                          log.getIpAddress(),
                          log.getCreatedAt()))
              .collect(Collectors.toList());

      return ResponseEntity.ok(logDTOs);
    } catch (SecurityException e) {
      return ResponseEntity.status(401).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
    }
  }

  @DeleteMapping("/users/{userId}")
  public ResponseEntity<?> deleteUser(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @PathVariable String userId) {
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

      if (currentUser.getId().equals(targetUser.getId())) {
        return ResponseEntity.status(400).body("Cannot delete your own account");
      }

      activityLogService.logActivity(
          currentUser, "USER_DELETE", "Deleted user account for " + targetUser.getEmail());

      userService.deleteUser(targetUser);

      return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    } catch (SecurityException e) {
      return ResponseEntity.status(401).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
    }
  }
}
