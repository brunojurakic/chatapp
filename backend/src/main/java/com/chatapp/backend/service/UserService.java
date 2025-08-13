package com.chatapp.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chatapp.backend.model.User;
import com.chatapp.backend.repository.UserRepository;

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
    
    public User createUser(String email, String name, String profilePictureUrl, String googleId) {
        User user = new User(email, name, profilePictureUrl, googleId);
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
            user.setProfilePictureUrl(profilePictureUrl);
            return updateUser(user);
        } else {
            return createUser(email, name, profilePictureUrl, googleId);
        }
    }
}
