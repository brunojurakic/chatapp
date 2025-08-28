package com.flow.backend.util;

import org.springframework.stereotype.Component;

import com.flow.backend.model.User;

@Component
public class UserDisplayUtil {

  public String getDisplayName(User user) {
    if (user == null) return null;
    return user.getDisplayName() != null ? user.getDisplayName() : user.getName();
  }

  public String getDisplayNameOrDefault(User user, String defaultName) {
    if (user == null) return defaultName;
    return user.getDisplayName() != null ? user.getDisplayName() : user.getName();
  }
}
