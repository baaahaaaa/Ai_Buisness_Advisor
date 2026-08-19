package com.aibusinessadvisor.backend.dto;

import lombok.Data;

@Data
public class VehicleRequest {
    private Integer clientId;
    private String brand;
    private String model;
    private Integer year;
    private Integer power;
    private Integer annualMileage;
    private String plateNumber;
}
