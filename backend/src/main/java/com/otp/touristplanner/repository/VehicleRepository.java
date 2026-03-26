package com.otp.touristplanner.repository;

import com.otp.touristplanner.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Vehicle entity operations.
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByStatus(Vehicle.VehicleStatus status);

    List<Vehicle> findByVehicleTypeContainingIgnoreCase(String vehicleType);
}
