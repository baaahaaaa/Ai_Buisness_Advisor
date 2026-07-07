package com.aibusinessadvisor.backend.repository;

import com.aibusinessadvisor.backend.entity.Sinistre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SinistreRepository extends JpaRepository<Sinistre, Integer> {
    List<Sinistre> findByClient_ClientId(Integer clientId);
}