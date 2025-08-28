package com.flow.backend.util;

import com.flow.backend.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserUtil {

  public String getProfilePictureUrl(User user, String defaultPictureUrl) {
    if (user != null
        && user.getProfilePictureUrl() != null
        && !user.getProfilePictureUrl().isEmpty()) {
      return user.getProfilePictureUrl();
    }
    return defaultPictureUrl;
  }

  public void updateProfilePictureIfNeeded(User user, String newProfilePictureUrl) {
    if (user.getProfilePictureUrl() == null
        || user.getProfilePictureUrl().isEmpty()
        || user.getProfilePictureUrl().contains("googleusercontent.com")) {
      user.setProfilePictureUrl(newProfilePictureUrl);
    }
  }
}
