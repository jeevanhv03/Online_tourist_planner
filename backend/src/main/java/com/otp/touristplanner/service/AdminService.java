package com.otp.touristplanner.service;

import com.otp.touristplanner.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for admin dashboard analytics and statistics.
 */
@Service
public class AdminService {

    @Autowired
    private BookingRepository bookingRepository;

    /**
     * Returns dashboard analytics data.
     */
    public Map<String, Object> getDashboardAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        Long totalBookings = bookingRepository.countActiveBookings();
        Double totalRevenue = bookingRepository.getTotalRevenue();

        analytics.put("totalBookings", totalBookings != null ? totalBookings : 0);
        analytics.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        // Most popular packages
        List<Object[]> popularPackages = bookingRepository.getMostPopularPackages();
        if (!popularPackages.isEmpty()) {
            Object[] top = popularPackages.get(0);
            analytics.put("mostPopularPackage", top[0]);
        }

        // Vehicle usage stats
        List<Object[]> vehicleStats = bookingRepository.getVehicleUsageStatistics();
        analytics.put("vehicleUsageStats", vehicleStats.stream()
                .map(row -> Map.of("vehicleType", row[0], "count", row[1]))
                .toList());

        // Monthly revenue
        List<Object[]> monthlyRevenue = bookingRepository.getMonthlyRevenue();
        analytics.put("monthlyRevenue", monthlyRevenue.stream()
                .map(row -> Map.of("month", row[0], "revenue", row[1]))
                .toList());

        // Popular packages list
        analytics.put("popularPackages", popularPackages.stream()
                .limit(5)
                .map(row -> Map.of("destination", row[0], "bookings", row[1]))
                .toList());

        return analytics;
    }
}
