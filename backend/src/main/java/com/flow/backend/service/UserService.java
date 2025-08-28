package com.flow.backend.service;

import com.flow.backend.model.User;
import com.flow.backend.repository.UserRepository;
import com.flow.backend.util.UserUtil;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

  @Autowired private UserRepository userRepository;

  @Autowired private RoleService roleService;

  @Autowired private UserUtil userUtil;

  public Optional<User> findByEmail(String email) {
    return userRepository.findByEmail(email);
  }

  public Optional<User> findByGoogleId(String googleId) {
    return userRepository.findByGoogleId(googleId);
  }

  public Optional<User> findByUsername(String username) {
    return userRepository.findByUsername(username);
  }

  public Optional<User> findById(java.util.UUID id) {
    return userRepository.findById(id);
  }

  public List<User> searchUsers(String q) {
    if (q == null || q.trim().isEmpty()) return List.of();
    return userRepository.findByUsernameContainingIgnoreCaseOrNameContainingIgnoreCase(q, q);
  }

  public User createUser(String email, String name, String profilePictureUrl, String googleId) {
    User user = new User(email, name, profilePictureUrl, googleId, null, null);
    return userRepository.save(user);
  }

  public User updateUser(User user) {
    return userRepository.save(user);
  }

  public User findOrCreateUser(
      String email, String name, String profilePictureUrl, String googleId) {
    Optional<User> existingUser = findByGoogleId(googleId);

    if (existingUser.isPresent()) {
      User user = existingUser.get();
      user.setName(name);
      userUtil.updateProfilePictureIfNeeded(user, profilePictureUrl);
      roleService.assignRegularRoleIfNone(user);
      return updateUser(user);
    } else {
      User newUser = createUser(email, name, profilePictureUrl, googleId);
      roleService.assignRoleToUser(newUser, "REGULAR");
      return newUser;
    }
  }

  public boolean isUsernameTaken(String username) {
    return userRepository.existsByUsername(username);
  }

  public User setUsernameAndDisplayName(String email, String username, String displayName) {
    Optional<User> opt = findByEmail(email);
    if (opt.isEmpty()) throw new IllegalArgumentException("User not found");
    User user = opt.get();
    user.setUsername(username);
    user.setDisplayName(displayName);
    return updateUser(user);
  }

  public List<User> findAll() {
    return userRepository.findAll();
  }

  public void migrateExistingUsersToRoles() {
    List<User> allUsers = userRepository.findAll();
    for (User user : allUsers) {
      roleService.assignRegularRoleIfNone(user);
    }
  }
}
