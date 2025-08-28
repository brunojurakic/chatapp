package com.flow.backend.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.flow.backend.model.User;
import com.flow.backend.service.UserService;

@Component
public class AuthUtil {

  @Autowired private JwtUtil jwtUtil;

  @Autowired private UserService userService;

  public User validateAndGetUser(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      throw new SecurityException("Not authenticated");
    }

    String token = authHeader.substring(7);
    if (!jwtUtil.validateToken(token)) {
      throw new SecurityException("Invalid token");
    }

    String email = jwtUtil.extractUsername(token);
    return userService
        .findByEmail(email)
        .orElseThrow(() -> new SecurityException("User not found"));
  }

  public String extractEmailFromToken(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      throw new SecurityException("Not authenticated");
    }

    String token = authHeader.substring(7);
    if (!jwtUtil.validateToken(token)) {
      throw new SecurityException("Invalid token");
    }

    return jwtUtil.extractUsername(token);
  }

  public JwtClaims extractClaimsFromToken(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      throw new SecurityException("Not authenticated");
    }

    String token = authHeader.substring(7);
    if (!jwtUtil.validateToken(token)) {
      throw new SecurityException("Invalid token");
    }

    String email = jwtUtil.extractUsername(token);
    String name = jwtUtil.extractClaim(token, claims -> claims.get("name", String.class));
    String picture = jwtUtil.extractClaim(token, claims -> claims.get("picture", String.class));

    return new JwtClaims(email, name, picture);
  }

  public static class JwtClaims {
    public final String email;
    public final String name;
    public final String picture;

    public JwtClaims(String email, String name, String picture) {
      this.email = email;
      this.name = name;
      this.picture = picture;
    }
  }
}
