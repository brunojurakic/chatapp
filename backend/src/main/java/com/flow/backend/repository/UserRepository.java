package com.flow.backend.repository;

import com.flow.backend.model.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

  Optional<User> findByEmail(String email);

  Optional<User> findByGoogleId(String googleId);

  boolean existsByEmail(String email);

  Optional<User> findByUsername(String username);

  boolean existsByUsername(String username);

  List<User> findByUsernameContainingIgnoreCaseOrNameContainingIgnoreCase(
      String username, String name);
}
