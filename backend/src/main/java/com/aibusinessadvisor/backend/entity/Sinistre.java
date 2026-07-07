package com.aibusinessadvisor.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "sinistres")
@Data
public class Sinistre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sinistre_id")
    private Integer sinistreId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    @JsonIgnore
    private Client client;

    @Column(name = "date_sinistre")
    private LocalDate dateSinistre;

    private BigDecimal montant;

    @Column(name = "type_sinistre")
    private String typeSinistre;
}