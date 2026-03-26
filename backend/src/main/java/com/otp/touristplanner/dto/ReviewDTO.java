package com.otp.touristplanner.dto;

import com.otp.touristplanner.entity.Review;

import java.time.LocalDateTime;

public class ReviewDTO {
    private Long reviewId;
    private Long packageId;
    private String username;
    private String destinationName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private boolean isVisible;

    public static ReviewDTO fromReview(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setReviewId(review.getReviewId());

        if (review.getTourPackage() != null) {
            dto.setPackageId(review.getTourPackage().getPackageId());
            dto.setDestinationName(review.getTourPackage().getDestinationName());
        }

        if (review.getUser() != null) {
            dto.setUsername(review.getUser().getUsername());
        }

        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setVisible(review.isVisible());
        return dto;
    }

    // Getters and Setters
    public Long getReviewId() {
        return reviewId;
    }

    public void setReviewId(Long reviewId) {
        this.reviewId = reviewId;
    }

    public Long getPackageId() {
        return packageId;
    }

    public void setPackageId(Long packageId) {
        this.packageId = packageId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDestinationName() {
        return destinationName;
    }

    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isVisible() {
        return isVisible;
    }

    public void setVisible(boolean visible) {
        isVisible = visible;
    }
}
