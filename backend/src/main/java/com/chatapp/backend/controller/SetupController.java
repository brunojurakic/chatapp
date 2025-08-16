package com.chatapp.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chatapp.backend.dto.UserDTO;
import com.chatapp.backend.model.User;
import com.chatapp.backend.service.UserService;
import com.chatapp.backend.util.JwtUtil;

@RestController
@RequestMapping("/api/setup")
public class SetupController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> setupUser(@RequestHeader(value = "Authorization", required = false) String authHeader,
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
            String username = body.get("username");
            String displayName = body.get("displayName");

            User currentUser = userService.findByEmail(email).orElse(null);

            if (username == null || username.length() < 3) {
                return ResponseEntity.badRequest().body("Username must be at least 3 characters");
            }

            username = username.trim();
            if (username.startsWith("@")) username = username.substring(1);
            username = username.toLowerCase();

            if (currentUser == null || currentUser.getUsername() == null || !currentUser.getUsername().equals(username)) {
                if (userService.isUsernameTaken(username)) {
                    return ResponseEntity.status(409).body("Username already taken");
                }
            }

            User updated = userService.setUsernameAndDisplayName(email, username, displayName);

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
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.status(404).body(iae.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }
}
