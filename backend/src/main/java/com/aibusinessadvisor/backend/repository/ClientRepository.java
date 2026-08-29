package com.aibusinessadvisor.backend.repository;

import com.aibusinessadvisor.backend.entity.Client;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ClientRepository
        extends JpaRepository<Client, Integer> {

}