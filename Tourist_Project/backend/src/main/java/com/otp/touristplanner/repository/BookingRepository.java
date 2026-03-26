package com.otp.touristplanner.repository;

import com.otp.touristplanner.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for Booking entity operations.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByBookingDateDesc(Long userId);

    List<Booking> findByTourPackagePackageId(Long packageId);

    /**
     * Check if a vehicle is already booked for a given date range.
     * Returns bookings that overlap with the requested period.
     */
    @Query("SELECT b FROM Booking b WHERE b.vehicle.vehicleId = :vehicleId " +
            "AND b.bookingStatus != 'CANCELLED' " +
            "AND (b.travelStartDate <= :endDate AND b.travelEndDate >= :startDate)")
    List<Booking> findConflictingBookings(
            @Param("vehicleId") Long vehicleId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingStatus != 'CANCELLED'")
    Long countActiveBookings();

    @Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.paymentStatus = 'PAID'")
    Double getTotalRevenue();

    @Query("SELECT b.tourPackage.destinationName, COUNT(b) as cnt FROM Booking b " +
            "WHERE b.bookingStatus != 'CANCELLED' " +
            "GROUP BY b.tourPackage.packageId ORDER BY cnt DESC")
    List<Object[]> getMostPopularPackages();

    @Query("SELECT b.vehicle.vehicleType, COUNT(b) as cnt FROM Booking b " +
            "WHERE b.bookingStatus != 'CANCELLED' " +
            "GROUP BY b.vehicle.vehicleId ORDER BY cnt DESC")
    List<Object[]> getVehicleUsageStatistics();

    @Query("SELECT MONTH(b.bookingDate), SUM(b.totalAmount) FROM Booking b " +
            "WHERE b.paymentStatus = 'PAID' AND YEAR(b.bookingDate) = YEAR(CURRENT_DATE) " +
            "GROUP BY MONTH(b.bookingDate) ORDER BY MONTH(b.bookingDate)")
    List<Object[]> getMonthlyRevenue();
}
