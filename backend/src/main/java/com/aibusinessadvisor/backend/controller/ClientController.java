package com.aibusinessadvisor.backend.controller;

import com.aibusinessadvisor.backend.dto.ClientRequest;
import com.aibusinessadvisor.backend.entity.Client;
import com.aibusinessadvisor.backend.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")
public class ClientController {

    @Autowired
    private ClientRepository clientRepository;

    @GetMapping
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Integer id) {
        Optional<Client> client = clientRepository.findById(id);
        return client.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/count")
    public long countClients() {
        return clientRepository.count();
    }

    @PostMapping
    public ResponseEntity<Client> createClient(@RequestBody ClientRequest request) {
        Client client = new Client();
        client.setNom(request.getNom());
        client.setPrenom(request.getPrenom());
        client.setAge(request.getAge());
        client.setDateInscription(request.getDateInscription());
        client.setAncienneteAnnees(request.getAncienneteAnnees());
        client.setPuissanceVehicule(request.getPuissanceVehicule());
        client.setKmAnnuel(request.getKmAnnuel());
        client.setVille(request.getVille());

        Client saved = clientRepository.save(client);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable Integer id, @RequestBody ClientRequest request) {
        Optional<Client> existing = clientRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Client client = existing.get();
        client.setNom(request.getNom());
        client.setPrenom(request.getPrenom());
        client.setAge(request.getAge());
        client.setDateInscription(request.getDateInscription());
        client.setAncienneteAnnees(request.getAncienneteAnnees());
        client.setPuissanceVehicule(request.getPuissanceVehicule());
        client.setKmAnnuel(request.getKmAnnuel());
        client.setVille(request.getVille());

        Client updated = clientRepository.save(client);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Integer id) {
        if (!clientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        clientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}