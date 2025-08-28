package com.flow.backend.repository;

import com.flow.backend.model.User;
import com.flow.backend.model.UserRole;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {
  List<UserRole> findByUser(User user);

  boolean existsByUserAndRole_Name(User user, String roleName);
}
