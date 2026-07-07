package com.aibusinessadvisor.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "paiements")
@Data
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "paiement_id")
    private Integer paiementId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    @JsonIgnore
    private Client client;

    @Column(name = "date_paiement")
    private LocalDate datePaiement;

    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    private StatutPaiement statut;

    public enum StatutPaiement {
        paye, retard, impaye
    }
}