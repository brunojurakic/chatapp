package com.flow.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.flow.backend.model.User;
import com.flow.backend.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByGoogleId(String googleId) {
        return userRepository.findByGoogleId(googleId);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User createUser(String email, String name, String profilePictureUrl, String googleId) {
        User user = new User(email, name, profilePictureUrl, googleId, null, null);
        return userRepository.save(user);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public User findOrCreateUser(String email, String name, String profilePictureUrl, String googleId) {
        Optional<User> existingUser = findByGoogleId(googleId);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setName(name);
            if (user.getProfilePictureUrl() == null || 
                user.getProfilePictureUrl().isEmpty() || 
                user.getProfilePictureUrl().contains("googleusercontent.com")) {
                user.setProfilePictureUrl(profilePictureUrl);
            }
            return updateUser(user);
        } else {
            return createUser(email, name, profilePictureUrl, googleId);
        }
    }

    public boolean isUsernameTaken(String username) {
        return userRepository.existsByUsername(username);
    }

    public User setUsernameAndDisplayName(String email, String username, String displayName) {
        Optional<User> opt = findByEmail(email);
        if (opt.isEmpty())
            throw new IllegalArgumentException("User not found");
        User user = opt.get();
        user.setUsername(username);
        user.setDisplayName(displayName);
        return updateUser(user);
    }
}
