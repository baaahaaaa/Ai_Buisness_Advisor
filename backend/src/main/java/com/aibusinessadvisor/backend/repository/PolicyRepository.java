package com.aibusinessadvisor.backend.repository;

import com.aibusinessadvisor.backend.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PolicyRepository extends JpaRepository<Policy,Integer>{

    Optional<Policy> findByPolicyNumber(String policyNumber);

    List<Policy> findByClientId(Integer clientId);

}