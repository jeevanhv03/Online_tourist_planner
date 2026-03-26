package com.otp.touristplanner.controller;

import com.otp.touristplanner.dto.ReviewDTO;
import com.otp.touristplanner.security.UserDetailsImpl;
import com.otp.touristplanner.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllReviews() {
        try {
            List<ReviewDTO> reviews = reviewService.getAllReviews();
            System.out.println("DEBUG: getAllReviews returned " + reviews.size() + " reviews");
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            System.err.println("DEBUG: Error in getAllReviews: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error loading reviews: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> payload) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "You must be logged in to post a review"));
        }
        try {
            Long packageId = Long.valueOf(payload.get("packageId").toString());
            Integer rating = Integer.valueOf(payload.get("rating").toString());
            String comment = payload.get("comment") != null ? payload.get("comment").toString() : "";

            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(Map.of("message", "Rating must be between 1 and 5"));
            }

            ReviewDTO review = reviewService.createReview(userDetails.getId(), packageId, rating, comment);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Error submitting review: " + e.getMessage()));
        }
    }

    @GetMapping("/package/{packageId}")
    public ResponseEntity<List<ReviewDTO>> getPackageReviews(@PathVariable Long packageId) {
        return ResponseEntity.ok(reviewService.getPackageReviews(packageId));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<ReviewDTO>> getUserReviews(@PathVariable String username) {
        return ResponseEntity.ok(reviewService.getUserReviews(username));
    }

    @PatchMapping("/{reviewId}/visibility")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleVisibility(
            @PathVariable Long reviewId,
            @RequestBody Map<String, Boolean> payload) {
        try {
            boolean isVisible = payload.get("isVisible");
            reviewService.toggleReviewVisibility(reviewId, isVisible);
            return ResponseEntity.ok(Map.of("message", "Review visibility updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
