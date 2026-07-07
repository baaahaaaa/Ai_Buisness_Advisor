package com.aibusinessadvisor.backend.repository;

import com.aibusinessadvisor.backend.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Integer> {
    List<Paiement> findByClient_ClientId(Integer clientId);
}