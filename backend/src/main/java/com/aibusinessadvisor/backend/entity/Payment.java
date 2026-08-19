package com.aibusinessadvisor.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payment")
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    @JsonIgnore
    private Policy policy;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PAID;

    @Column(name = "late_days")
    private Integer lateDays = 0;

    public enum Status {
        PAID, LATE, UNPAID
    }
}
