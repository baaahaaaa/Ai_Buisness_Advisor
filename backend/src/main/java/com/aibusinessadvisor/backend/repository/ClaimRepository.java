package com.aibusinessadvisor.backend.repository;

import com.aibusinessadvisor.backend.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimRepository extends JpaRepository<Claim, Integer> {

}
