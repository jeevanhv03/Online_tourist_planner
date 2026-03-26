package com.otp.touristplanner.service;

import com.otp.touristplanner.entity.Vehicle;
import com.otp.touristplanner.entity.VehicleSchedule;
import com.otp.touristplanner.repository.BookingRepository;
import com.otp.touristplanner.repository.VehicleRepository;
import com.otp.touristplanner.repository.VehicleScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Service for Vehicle CRUD and availability checks.
 */
@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private VehicleScheduleRepository vehicleScheduleRepository;

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        vehicle.setStatus(Vehicle.VehicleStatus.AVAILABLE);
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, Vehicle vehicleDetails) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setVehicleType(vehicleDetails.getVehicleType());
        vehicle.setCapacity(vehicleDetails.getCapacity());
        vehicle.setMileage(vehicleDetails.getMileage());
        vehicle.setChargePerKm(vehicleDetails.getChargePerKm());
        vehicle.setMiscCharges(vehicleDetails.getMiscCharges());
        vehicle.setStatus(vehicleDetails.getStatus());
        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }

    public List<Vehicle> getAvailableVehicles() {
        return vehicleRepository.findByStatus(Vehicle.VehicleStatus.AVAILABLE);
    }

    /**
     * Checks if a vehicle is available for a given date range.
     * Returns true if available (no conflicting bookings).
     */
    public boolean isVehicleAvailable(Long vehicleId, LocalDate startDate, LocalDate endDate) {
        List<?> conflicts = bookingRepository.findConflictingBookings(vehicleId, startDate, endDate);
        return conflicts.isEmpty();
    }

    /**
     * Returns vehicles available for the given date range.
     */
    public List<Vehicle> getAvailableVehiclesForDateRange(LocalDate startDate, LocalDate endDate) {
        List<Vehicle> all = vehicleRepository.findAll();
        return all.stream()
                .filter(v -> v.getStatus() != Vehicle.VehicleStatus.MAINTENANCE)
                .filter(v -> isVehicleAvailable(v.getVehicleId(), startDate, endDate))
                .toList();
    }

    /**
     * Auto-assigns an available vehicle with enough capacity.
     */
    public Vehicle autoAssignVehicle(LocalDate startDate, LocalDate endDate, Integer passengerCount) {
        return getAvailableVehiclesForDateRange(startDate, endDate).stream()
                .filter(v -> v.getCapacity() >= passengerCount)
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "No vehicle available with the required capacity for the selected dates."));
    }

    /**
     * Gets the schedule calendar for a vehicle.
     */
    public List<VehicleSchedule> getVehicleCalendar(Long vehicleId) {
        return vehicleScheduleRepository.findByVehicleVehicleId(vehicleId);
    }
}
