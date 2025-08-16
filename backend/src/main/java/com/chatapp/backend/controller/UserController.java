package com.chatapp.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chatapp.backend.dto.UserDTO;
import com.chatapp.backend.model.User;
import com.chatapp.backend.service.UserService;
import com.chatapp.backend.util.JwtUtil;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                           @RequestBody Map<String, String> body) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String token = authHeader.substring(7);
        try {
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401).body("Invalid token");
            }

            String email = jwtUtil.extractUsername(token);
            String displayName = body.get("displayName");
            String themePreference = body.get("themePreference");

            User currentUser = userService.findByEmail(email).orElse(null);
            if (currentUser == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            if (displayName != null && !displayName.trim().isEmpty()) {
                currentUser.setDisplayName(displayName.trim());
            }

            if (themePreference != null && (themePreference.equals("light") || themePreference.equals("dark") || themePreference.equals("system"))) {
                currentUser.setThemePreference(themePreference);
            }

            User updated = userService.updateUser(currentUser);

            UserDTO userDTO = new UserDTO(
                updated.getDisplayName(), 
                updated.getEmail(), 
                updated.getProfilePictureUrl(), 
                true, 
                updated.getUsername(), 
                updated.getDisplayName(),
                updated.getThemePreference()
            );
            
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }
}
