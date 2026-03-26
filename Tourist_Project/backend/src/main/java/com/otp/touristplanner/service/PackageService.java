package com.otp.touristplanner.service;

import com.otp.touristplanner.entity.TourPackage;
import com.otp.touristplanner.repository.PackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for managing tour packages.
 */
@Service
public class PackageService {

    @Autowired
    private PackageRepository packageRepository;

    public List<TourPackage> getAllPackages() {
        return packageRepository.findAll();
    }

    public List<TourPackage> getActivePackages() {
        return packageRepository.findByActiveTrue();
    }

    public TourPackage getPackageById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));
    }

    public List<TourPackage> searchByDestination(String destination) {
        return packageRepository.findByDestinationNameContainingIgnoreCaseAndActiveTrue(destination);
    }

    public List<TourPackage> searchByPriceRange(Double minPrice, Double maxPrice) {
        return packageRepository.findByPriceBetweenAndActiveTrue(minPrice, maxPrice);
    }

    public List<TourPackage> filterPackages(String destination, Double minPrice, Double maxPrice, Double minRating,
            Integer minDays) {
        return packageRepository.filterPackages(destination, minPrice, maxPrice, minRating, minDays);
    }

    public List<TourPackage> getRecommendedPackages() {
        return packageRepository.findTop4ByActiveTrueOrderByAverageRatingDescTotalReviewsDesc();
    }

    public TourPackage createPackage(TourPackage tourPackage) {
        tourPackage.setActive(true);
        return packageRepository.save(tourPackage);
    }

    public TourPackage updatePackage(Long id, TourPackage details) {
        TourPackage pkg = getPackageById(id);
        pkg.setDestinationName(details.getDestinationName());
        pkg.setNumberOfDays(details.getNumberOfDays());
        pkg.setNumberOfNights(details.getNumberOfNights());
        pkg.setPackageCapacity(details.getPackageCapacity());
        pkg.setPrice(details.getPrice());
        pkg.setFoodDetails(details.getFoodDetails());
        pkg.setAccommodationDetails(details.getAccommodationDetails());
        pkg.setSightseeingDetails(details.getSightseeingDetails());
        pkg.setDescription(details.getDescription());
        pkg.setImageUrl(details.getImageUrl());
        return packageRepository.save(pkg);
    }

    public void deletePackage(Long id) {
        TourPackage pkg = getPackageById(id);
        pkg.setActive(false); // Soft delete
        packageRepository.save(pkg);
    }
}
