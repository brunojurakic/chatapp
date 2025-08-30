package com.flow.backend.service;

import com.flow.backend.model.Role;
import com.flow.backend.model.User;
import com.flow.backend.model.UserRole;
import com.flow.backend.repository.RoleRepository;
import com.flow.backend.repository.UserRoleRepository;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleService {

  @Autowired private RoleRepository roleRepository;

  @Autowired private UserRoleRepository userRoleRepository;

  public Optional<Role> findByName(String name) {
    return roleRepository.findByName(name);
  }

  public Role createRole(String name, String description) {
    Role role = new Role(name, description);
    return roleRepository.save(role);
  }

  public Role findOrCreateRole(String name, String description) {
    return findByName(name).orElseGet(() -> createRole(name, description));
  }

  @Transactional
  public void assignRoleToUser(User user, String roleName) {
    Role role = findOrCreateRole(roleName, getRoleDescription(roleName));
    if (!userRoleRepository.existsByUserAndRole_Name(user, roleName)) {
      UserRole userRole = new UserRole(user, role);
      userRoleRepository.save(userRole);
    }
  }

  public void ensureDefaultRolesExist() {
    findOrCreateRole("ADMIN", "Administrator with full system access");
    findOrCreateRole("REGULAR", "Regular user with standard permissions");
  }

  public void assignRegularRoleIfNone(User user) {
    List<UserRole> userRoles = userRoleRepository.findByUser(user);
    if (userRoles.isEmpty()) {
      assignRoleToUser(user, "REGULAR");
    }
  }

  public Set<String> getUserRoles(User user) {
    List<UserRole> userRoles = userRoleRepository.findByUser(user);
    return userRoles.stream()
        .map(userRole -> userRole.getRole().getName())
        .collect(Collectors.toSet());
  }

  public List<Role> getAllRoles() {
    return roleRepository.findAll();
  }

  @Transactional
  public void removeRoleFromUser(User user, String roleName) {
    userRoleRepository.deleteByUserAndRole_Name(user, roleName);
  }

  private String getRoleDescription(String roleName) {
    return switch (roleName.toUpperCase()) {
      case "ADMIN" -> "Administrator with full system access";
      case "REGULAR" -> "Regular user with standard permissions";
      default -> "Custom role";
    };
  }
}
