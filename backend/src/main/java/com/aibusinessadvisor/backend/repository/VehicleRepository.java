package com.aibusinessadvisor.backend.repository;

import com.aibusinessadvisor.backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle,Integer>{

    List<Vehicle> findByClientId(Integer clientId);

}