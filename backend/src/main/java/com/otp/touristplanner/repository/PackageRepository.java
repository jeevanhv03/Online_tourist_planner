package com.otp.touristplanner.repository;

import com.otp.touristplanner.entity.TourPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for TourPackage entity operations.
 */
@Repository
public interface PackageRepository extends JpaRepository<TourPackage, Long> {
    List<TourPackage> findByActiveTrue();

    List<TourPackage> findByDestinationNameContainingIgnoreCaseAndActiveTrue(String destinationName);

    List<TourPackage> findByPriceBetweenAndActiveTrue(Double minPrice, Double maxPrice);

    @Query("SELECT p FROM TourPackage p WHERE p.active = true " +
            "AND (:destination IS NULL OR LOWER(p.destinationName) LIKE LOWER(CONCAT('%', :destination, '%'))) " +
            "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
            "AND (:minRating IS NULL OR p.averageRating >= :minRating) " +
            "AND (:minDays IS NULL OR p.numberOfDays >= :minDays)")
    List<TourPackage> filterPackages(
            @Param("destination") String destination,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("minRating") Double minRating,
            @Param("minDays") Integer minDays);

    List<TourPackage> findTop4ByActiveTrueOrderByAverageRatingDescTotalReviewsDesc();
}
