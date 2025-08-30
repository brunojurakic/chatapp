package com.flow.backend.repository;

import com.flow.backend.model.User;
import com.flow.backend.model.UserRole;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {
  List<UserRole> findByUser(User user);

  boolean existsByUserAndRole_Name(User user, String roleName);

  void deleteByUserAndRole_Name(User user, String roleName);

  @Modifying
  @Transactional
  void deleteByUser(User user);
}
