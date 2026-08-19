package com.aibusinessadvisor.backend.dto;

import com.aibusinessadvisor.backend.entity.Policy;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PolicyRequest {
    private Integer clientId;
    private Integer vehicleId;
    private String policyNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal premium;
    private Policy.Status status;
}
