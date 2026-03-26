package com.otp.touristplanner.entity;

import jakarta.persistence.*;

/**
 * Vehicle entity for managing transport vehicles.
 */
@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleId;

    @Column(nullable = false)
    private String vehicleType;

    @Column(nullable = false)
    private Integer capacity;

    private Double mileage;

    @Column(nullable = false)
    private Double chargePerKm;

    private Double miscCharges;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    public enum VehicleStatus {
        AVAILABLE, BOOKED, MAINTENANCE
    }

    public Vehicle() {
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String vehicleType;
        private Integer capacity;
        private Double mileage;
        private Double chargePerKm;
        private Double miscCharges;
        private VehicleStatus status;

        public Builder vehicleType(String v) {
            this.vehicleType = v;
            return this;
        }

        public Builder capacity(Integer v) {
            this.capacity = v;
            return this;
        }

        public Builder mileage(Double v) {
            this.mileage = v;
            return this;
        }

        public Builder chargePerKm(Double v) {
            this.chargePerKm = v;
            return this;
        }

        public Builder miscCharges(Double v) {
            this.miscCharges = v;
            return this;
        }

        public Builder status(VehicleStatus v) {
            this.status = v;
            return this;
        }

        public Vehicle build() {
            Vehicle vh = new Vehicle();
            vh.vehicleType = vehicleType;
            vh.capacity = capacity;
            vh.mileage = mileage;
            vh.chargePerKm = chargePerKm;
            vh.miscCharges = miscCharges;
            vh.status = status;
            return vh;
        }
    }

    // Getters/Setters
    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Double getMileage() {
        return mileage;
    }

    public void setMileage(Double mileage) {
        this.mileage = mileage;
    }

    public Double getChargePerKm() {
        return chargePerKm;
    }

    public void setChargePerKm(Double chargePerKm) {
        this.chargePerKm = chargePerKm;
    }

    public Double getMiscCharges() {
        return miscCharges;
    }

    public void setMiscCharges(Double miscCharges) {
        this.miscCharges = miscCharges;
    }

    public VehicleStatus getStatus() {
        return status;
    }

    public void setStatus(VehicleStatus status) {
        this.status = status;
    }
}
