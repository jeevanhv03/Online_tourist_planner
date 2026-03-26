package com.otp.touristplanner.dto;

import com.otp.touristplanner.entity.CustomPackageRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class CustomPackageRequestDTO {
    private Long id;
    private Long userId;
    private String username;
    private String destination;
    private Integer passengerCount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String preferences;
    private String status;
    private Double price;
    private String adminNotes;
    private LocalDateTime createdAt;

    public static CustomPackageRequestDTO fromEntity(CustomPackageRequest entity) {
        CustomPackageRequestDTO dto = new CustomPackageRequestDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        dto.setUsername(entity.getUser().getUsername());
        dto.setDestination(entity.getDestination());
        dto.setPassengerCount(entity.getPassengerCount());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setPreferences(entity.getPreferences());
        dto.setStatus(entity.getStatus().name());
        dto.setPrice(entity.getPrice());
        dto.setAdminNotes(entity.getAdminNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public Integer getPassengerCount() {
        return passengerCount;
    }

    public void setPassengerCount(Integer passengerCount) {
        this.passengerCount = passengerCount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getPreferences() {
        return preferences;
    }

    public void setPreferences(String preferences) {
        this.preferences = preferences;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
