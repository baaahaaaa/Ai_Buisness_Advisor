package com.aibusinessadvisor.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ClientRequest {
    private String nom;
    private String prenom;
    private Integer age;
    private LocalDate dateInscription;
    private Integer ancienneteAnnees;
    private Integer puissanceVehicule;
    private Integer kmAnnuel;
    private String ville;
}