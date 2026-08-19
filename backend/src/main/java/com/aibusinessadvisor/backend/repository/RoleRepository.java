package com.aibusinessadvisor.backend.repository;

import com.aibusinessadvisor.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role,Integer>{

    Optional<Role> findByName(Role.RoleName name);

}