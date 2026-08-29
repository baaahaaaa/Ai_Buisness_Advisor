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


    // =====================================================
    // GET ALL CLIENTS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Client>> getAllClients() {

        return ResponseEntity.ok(
            clientRepository.findAll()
        );

    }


    // =====================================================
    // COUNT CLIENTS
    // =====================================================

    @GetMapping("/count")
    public ResponseEntity<Long> countClients() {

        return ResponseEntity.ok(
            clientRepository.count()
        );

    }


    // =====================================================
    // GET CLIENT BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClient(
            @PathVariable Integer id
    ) {

        return clientRepository
                .findById(id)
                .map(ResponseEntity::ok)
                .orElse(
                    ResponseEntity.notFound().build()
                );

    }


    // =====================================================
    // CREATE CLIENT
    // =====================================================

    @PostMapping
    public ResponseEntity<Client> create(
            @RequestBody ClientRequest request
    ) {

        Client client = new Client();


        client.setFirstName(
            request.getFirstName()
        );

        client.setLastName(
            request.getLastName()
        );

        client.setGender(
            request.getGender()
        );

        client.setBirthDate(
            request.getBirthDate()
        );

        client.setPhone(
            request.getPhone()
        );

        client.setEmail(
            request.getEmail()
        );

        client.setAddress(
            request.getAddress()
        );


        Client savedClient =
            clientRepository.save(client);


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedClient);

    }


    // =====================================================
    // UPDATE CLIENT
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<Client> update(
            @PathVariable Integer id,
            @RequestBody ClientRequest request
    ) {

        return clientRepository
                .findById(id)
                .map(client -> {


                    client.setFirstName(
                        request.getFirstName()
                    );

                    client.setLastName(
                        request.getLastName()
                    );

                    client.setGender(
                        request.getGender()
                    );

                    client.setBirthDate(
                        request.getBirthDate()
                    );

                    client.setPhone(
                        request.getPhone()
                    );

                    client.setEmail(
                        request.getEmail()
                    );

                    client.setAddress(
                        request.getAddress()
                    );


                    Client updatedClient =
                        clientRepository.save(client);


                    return ResponseEntity.ok(
                        updatedClient
                    );

                })
                .orElse(
                    ResponseEntity.notFound().build()
                );

    }


    // =====================================================
    // DELETE CLIENT
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Integer id
    ) {

        if (!clientRepository.existsById(id)) {

            return ResponseEntity
                    .notFound()
                    .build();

        }


        clientRepository.deleteById(id);


        return ResponseEntity
                .noContent()
                .build();

    }

}