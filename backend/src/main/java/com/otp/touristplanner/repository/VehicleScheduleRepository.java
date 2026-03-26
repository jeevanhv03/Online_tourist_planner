package com.otp.touristplanner.repository;

import com.otp.touristplanner.entity.VehicleSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for VehicleSchedule entity operations.
 */
@Repository
public interface VehicleScheduleRepository extends JpaRepository<VehicleSchedule, Long> {

    List<VehicleSchedule> findByVehicleVehicleId(Long vehicleId);

    @Query("SELECT vs FROM VehicleSchedule vs WHERE vs.vehicle.vehicleId = :vehicleId " +
            "AND (vs.startDate <= :endDate AND vs.endDate >= :startDate)")
    List<VehicleSchedule> findConflictingSchedules(
            @Param("vehicleId") Long vehicleId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
