package com.aibusinessadvisor.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "agent_result")
@Data
public class AgentResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @JsonIgnore
    private Client client;

    private String segment;

    @Column(name = "risk_score")
    private BigDecimal riskScore;

    @Column(name = "recommended_premium")
    private BigDecimal recommendedPremium;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    @Column(name = "fraud_score")
    private BigDecimal fraudScore;

    private String compliance;

    @Column(name = "analysis_date", updatable = false, insertable = false)
    private LocalDateTime analysisDate;
}
