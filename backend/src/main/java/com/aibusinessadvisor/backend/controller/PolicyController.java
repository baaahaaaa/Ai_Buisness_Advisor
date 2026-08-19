package com.aibusinessadvisor.backend.controller;

import com.aibusinessadvisor.backend.dto.PolicyRequest;
import com.aibusinessadvisor.backend.entity.Client;
import com.aibusinessadvisor.backend.entity.Policy;
import com.aibusinessadvisor.backend.entity.Vehicle;
import com.aibusinessadvisor.backend.repository.ClientRepository;
import com.aibusinessadvisor.backend.repository.PolicyRepository;
import com.aibusinessadvisor.backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/policies")
@CrossOrigin(origins = "*")
public class PolicyController {

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @GetMapping
    public List<Policy> getAllPolicies() {
        return policyRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Policy> getPolicyById(@PathVariable Integer id) {
        return policyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public List<Policy> getPoliciesByClient(@PathVariable Integer clientId) {
        return policyRepository.findByClientId(clientId);
    }

    @PostMapping
    public ResponseEntity<Policy> createPolicy(@RequestBody PolicyRequest request) {
        Optional<Client> client = clientRepository.findById(request.getClientId());
        Optional<Vehicle> vehicle = vehicleRepository.findById(request.getVehicleId());
        if (client.isEmpty() || vehicle.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Policy policy = new Policy();
        policy.setClient(client.get());
        policy.setVehicle(vehicle.get());
        applyRequest(policy, request);

        Policy saved = policyRepository.save(policy);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Policy> updatePolicy(@PathVariable Integer id, @RequestBody PolicyRequest request) {
        Optional<Policy> existing = policyRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Policy policy = existing.get();
        applyRequest(policy, request);

        Policy updated = policyRepository.save(policy);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Integer id) {
        if (!policyRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        policyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyRequest(Policy policy, PolicyRequest request) {
        policy.setPolicyNumber(request.getPolicyNumber());
        policy.setStartDate(request.getStartDate());
        policy.setEndDate(request.getEndDate());
        policy.setPremium(request.getPremium());
        if (request.getStatus() != null) {
            policy.setStatus(request.getStatus());
        }
    }
}
