package com.aibusinessadvisor.backend.controller;

import com.aibusinessadvisor.backend.dto.VehicleRequest;
import com.aibusinessadvisor.backend.entity.Client;
import com.aibusinessadvisor.backend.entity.Vehicle;
import com.aibusinessadvisor.backend.repository.ClientRepository;
import com.aibusinessadvisor.backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ClientRepository clientRepository;

    @GetMapping
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Integer id) {
        return vehicleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public List<Vehicle> getVehiclesByClient(@PathVariable Integer clientId) {
        return vehicleRepository.findByClientId(clientId);
    }

    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(@RequestBody VehicleRequest request) {
        Optional<Client> client = clientRepository.findById(request.getClientId());
        if (client.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setClient(client.get());
        applyRequest(vehicle, request);

        Vehicle saved = vehicleRepository.save(vehicle);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Integer id, @RequestBody VehicleRequest request) {
        Optional<Vehicle> existing = vehicleRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Vehicle vehicle = existing.get();
        applyRequest(vehicle, request);

        Vehicle updated = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Integer id) {
        if (!vehicleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        vehicleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyRequest(Vehicle vehicle, VehicleRequest request) {
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setPower(request.getPower());
        vehicle.setAnnualMileage(request.getAnnualMileage());
        vehicle.setPlateNumber(request.getPlateNumber());
    }
}
