package com.otp.touristplanner.controller;

import com.otp.touristplanner.entity.TourPackage;
import com.otp.touristplanner.service.PackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Tour Package management.
 */
@RestController
@RequestMapping("/api/packages")
@CrossOrigin(origins = "*")
public class PackageController {

    @Autowired
    private PackageService packageService;

    // Public endpoints
    @GetMapping("/public/all")
    public ResponseEntity<List<TourPackage>> getActivePackages() {
        return ResponseEntity.ok(packageService.getActivePackages());
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<TourPackage> getPublicPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    @GetMapping("/public/search")
    public ResponseEntity<List<TourPackage>> searchByDestination(@RequestParam String destination) {
        return ResponseEntity.ok(packageService.searchByDestination(destination));
    }

    @GetMapping("/public/filter")
    public ResponseEntity<List<TourPackage>> filterPackages(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Integer minDays) {
        return ResponseEntity.ok(packageService.filterPackages(destination, minPrice, maxPrice, minRating, minDays));
    }

    @GetMapping("/public/recommended")
    public ResponseEntity<List<TourPackage>> getRecommendedPackages() {
        return ResponseEntity.ok(packageService.getRecommendedPackages());
    }

    // Authenticated endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TourPackage>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourPackage> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TourPackage> createPackage(@RequestBody TourPackage tourPackage) {
        return ResponseEntity.ok(packageService.createPackage(tourPackage));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TourPackage> updatePackage(@PathVariable Long id, @RequestBody TourPackage tourPackage) {
        return ResponseEntity.ok(packageService.updatePackage(id, tourPackage));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.ok(Map.of("message", "Package deleted successfully"));
    }
}
