package com.flow.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.flow.backend.service.RoleService;
import com.flow.backend.service.UserService;

@Component
public class DataInitializer implements CommandLineRunner {

  @Autowired private RoleService roleService;

  @Autowired private UserService userService;

  @Override
  @Transactional
  public void run(String... args) throws Exception {
    roleService.ensureDefaultRolesExist();
    userService.migrateExistingUsersToRoles();
  }
}
