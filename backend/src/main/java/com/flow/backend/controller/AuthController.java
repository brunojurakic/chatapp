package com.flow.backend.controller;

import com.flow.backend.dto.UserDTO;
import com.flow.backend.model.User;
import com.flow.backend.service.RoleService;
import com.flow.backend.service.UserService;
import com.flow.backend.util.AuthUtil;
import com.flow.backend.util.UserUtil;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  @Autowired private UserService userService;

  @Autowired private RoleService roleService;

  @Autowired private AuthUtil authUtil;

  @Autowired private UserUtil userUtil;

  @GetMapping("/user")
  public ResponseEntity<?> getUser(
      @RequestHeader(value = "Authorization", required = false) String authHeader) {
    try {
      AuthUtil.JwtClaims claims = authUtil.extractClaimsFromToken(authHeader);

      User user = userService.findByEmail(claims.email).orElse(null);
      String username = user != null ? user.getUsername() : null;
      String userPicture = userUtil.getProfilePictureUrl(user, claims.picture);

      UserDTO userDTO =
          new UserDTO(
              user != null && user.getDisplayName() != null ? user.getDisplayName() : claims.name,
              claims.email,
              userPicture,
              true,
              username,
              user != null && user.getDisplayName() != null ? user.getDisplayName() : claims.name,
              user != null ? user.getThemePreference() : "system",
              user != null ? roleService.getUserRoles(user) : Set.of("REGULAR"));
      return ResponseEntity.ok(userDTO);
    } catch (SecurityException e) {
      return ResponseEntity.status(401).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(401).body("Invalid token");
    }
  }

  @PostMapping("/logout")
  public ResponseEntity<?> logout() {
    return ResponseEntity.ok().body("Logged out successfully");
  }
}
