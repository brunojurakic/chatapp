package com.flow.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flow.backend.dto.UserDTO;
import com.flow.backend.model.User;
import com.flow.backend.service.UserService;
import com.flow.backend.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @GetMapping("/user")
    public ResponseEntity<?> getUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String token = authHeader.substring(7);
        try {
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401).body("Invalid token");
            }

            String email = jwtUtil.extractUsername(token);
            String name = jwtUtil.extractClaim(token, claims -> claims.get("name", String.class));
            String picture = jwtUtil.extractClaim(token, claims -> claims.get("picture", String.class));

            User user = userService.findByEmail(email).orElse(null);
            String username = null;
            String userPicture = picture;
            if (user != null) {
                username = user.getUsername();
                if (user.getProfilePictureUrl() != null && !user.getProfilePictureUrl().isEmpty()) {
                    userPicture = user.getProfilePictureUrl();
                }
            }

            UserDTO userDTO = new UserDTO(user != null && user.getDisplayName() != null ? user.getDisplayName() : name,
                                          email,
                                          userPicture,
                                          true,
                                          username,
                                          user != null && user.getDisplayName() != null ? user.getDisplayName() : name,
                                          user != null ? user.getThemePreference() : "system");
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok().body("Logged out successfully");
    }
}
