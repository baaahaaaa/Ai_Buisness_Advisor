package com.aibusinessadvisor.backend.controller;

import com.aibusinessadvisor.backend.dto.ClientRequest;
import com.aibusinessadvisor.backend.entity.Client;
import com.aibusinessadvisor.backend.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClientController {

    private final ClientRepository clientRepository;

    @GetMapping
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClient(@PathVariable Integer id) {

        return clientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());

    }

    @PostMapping
    public ResponseEntity<Client> create(@RequestBody ClientRequest request) {

        Client client = new Client();

        client.setFirstName(request.getFirstName());
        client.setLastName(request.getLastName());
        client.setGender(request.getGender());
        client.setBirthDate(request.getBirthDate());
        client.setPhone(request.getPhone());
        client.setEmail(request.getEmail());
        client.setAddress(request.getAddress());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clientRepository.save(client));

    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> update(
            @PathVariable Integer id,
            @RequestBody ClientRequest request) {

        return clientRepository.findById(id)
                .map(client -> {

                    client.setFirstName(request.getFirstName());
                    client.setLastName(request.getLastName());
                    client.setGender(request.getGender());
                    client.setBirthDate(request.getBirthDate());
                    client.setPhone(request.getPhone());
                    client.setEmail(request.getEmail());
                    client.setAddress(request.getAddress());

                    return ResponseEntity.ok(clientRepository.save(client));

                })
                .orElse(ResponseEntity.notFound().build());

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {

        if (!clientRepository.existsById(id))
            return ResponseEntity.notFound().build();

        clientRepository.deleteById(id);

        return ResponseEntity.noContent().build();

    }

}