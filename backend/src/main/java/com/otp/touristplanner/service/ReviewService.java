package com.otp.touristplanner.service;

import com.otp.touristplanner.dto.ReviewDTO;
import com.otp.touristplanner.entity.Review;
import com.otp.touristplanner.entity.TourPackage;
import com.otp.touristplanner.entity.User;
import com.otp.touristplanner.repository.PackageRepository;
import com.otp.touristplanner.repository.ReviewRepository;
import com.otp.touristplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PackageRepository packageRepository;

    @Transactional
    public ReviewDTO createReview(Long userId, Long packageId, Integer rating, String comment) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        TourPackage tourPackage = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        Review review = new Review();
        review.setUser(user);
        review.setTourPackage(tourPackage);
        review.setRating(rating);
        review.setComment(comment);
        review = reviewRepository.save(review);

        // Update package average rating
        updatePackageRating(tourPackage);

        return ReviewDTO.fromReview(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewDTO> getPackageReviews(Long packageId) {
        return reviewRepository.findByTourPackagePackageId(packageId)
                .stream().map(ReviewDTO::fromReview).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewDTO> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(ReviewDTO::fromReview).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewDTO> getUserReviews(String username) {
        return reviewRepository.findByUserUsername(username)
                .stream().map(ReviewDTO::fromReview).collect(Collectors.toList());
    }

    @Transactional
    public void toggleReviewVisibility(Long reviewId, boolean isVisible) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setVisible(isVisible);
        reviewRepository.save(review);
        updatePackageRating(review.getTourPackage());
    }

    private void updatePackageRating(TourPackage tourPackage) {
        List<Review> visibleReviews = reviewRepository
                .findByTourPackagePackageIdAndIsVisibleTrue(tourPackage.getPackageId());
        if (visibleReviews.isEmpty()) {
            tourPackage.setAverageRating(0.0);
            tourPackage.setTotalReviews(0);
        } else {
            double sum = visibleReviews.stream().mapToDouble(Review::getRating).sum();
            tourPackage.setAverageRating(sum / visibleReviews.size());
            tourPackage.setTotalReviews(visibleReviews.size());
        }
        packageRepository.save(tourPackage);
    }
}
