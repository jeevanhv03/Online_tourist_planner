package com.otp.touristplanner.entity;

import jakarta.persistence.*;

/**
 * TourPackage entity representing travel packages.
 */
@Entity
@Table(name = "packages")
public class TourPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long packageId;

    @Column(nullable = false)
    private String destinationName;

    @Column(nullable = false)
    private Integer numberOfDays;

    @Column(nullable = false)
    private Integer numberOfNights;

    @Column(nullable = false)
    private Integer packageCapacity;

    @Column(nullable = false)
    private Double price;

    @Column(columnDefinition = "TEXT")
    private String foodDetails;

    @Column(columnDefinition = "TEXT")
    private String accommodationDetails;

    @Column(columnDefinition = "TEXT")
    private String sightseeingDetails;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    private Double latitude;
    private Double longitude;
    private String category;

    public TourPackage() {
    }

    // Builder
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String destinationName, foodDetails, accommodationDetails, sightseeingDetails, description, imageUrl,
                category;
        private Integer numberOfDays, numberOfNights, packageCapacity, totalReviews = 0;
        private Double price, averageRating = 0.0, latitude, longitude;
        private boolean active = true;

        public Builder destinationName(String v) {
            this.destinationName = v;
            return this;
        }

        public Builder numberOfDays(Integer v) {
            this.numberOfDays = v;
            return this;
        }

        public Builder numberOfNights(Integer v) {
            this.numberOfNights = v;
            return this;
        }

        public Builder packageCapacity(Integer v) {
            this.packageCapacity = v;
            return this;
        }

        public Builder price(Double v) {
            this.price = v;
            return this;
        }

        public Builder foodDetails(String v) {
            this.foodDetails = v;
            return this;
        }

        public Builder accommodationDetails(String v) {
            this.accommodationDetails = v;
            return this;
        }

        public Builder sightseeingDetails(String v) {
            this.sightseeingDetails = v;
            return this;
        }

        public Builder description(String v) {
            this.description = v;
            return this;
        }

        public Builder imageUrl(String v) {
            this.imageUrl = v;
            return this;
        }

        public Builder active(boolean v) {
            this.active = v;
            return this;
        }

        public Builder averageRating(Double v) {
            this.averageRating = v;
            return this;
        }

        public Builder totalReviews(Integer v) {
            this.totalReviews = v;
            return this;
        }

        public Builder longitude(Double v) {
            this.longitude = v;
            return this;
        }

        public Builder latitude(Double v) {
            this.latitude = v;
            return this;
        }

        public Builder category(String v) {
            this.category = v;
            return this;
        }

        public TourPackage build() {
            TourPackage p = new TourPackage();
            p.destinationName = destinationName;
            p.numberOfDays = numberOfDays;
            p.numberOfNights = numberOfNights;
            p.packageCapacity = packageCapacity;
            p.price = price;
            p.foodDetails = foodDetails;
            p.accommodationDetails = accommodationDetails;
            p.sightseeingDetails = sightseeingDetails;
            p.description = description;
            p.imageUrl = imageUrl;
            p.active = active;
            p.averageRating = averageRating;
            p.totalReviews = totalReviews;
            p.latitude = latitude;
            p.longitude = longitude;
            p.category = category;
            return p;
        }
    }

    // Getters/Setters
    public Long getPackageId() {
        return packageId;
    }

    public void setPackageId(Long packageId) {
        this.packageId = packageId;
    }

    public String getDestinationName() {
        return destinationName;
    }

    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }

    public Integer getNumberOfDays() {
        return numberOfDays;
    }

    public void setNumberOfDays(Integer numberOfDays) {
        this.numberOfDays = numberOfDays;
    }

    public Integer getNumberOfNights() {
        return numberOfNights;
    }

    public void setNumberOfNights(Integer numberOfNights) {
        this.numberOfNights = numberOfNights;
    }

    public Integer getPackageCapacity() {
        return packageCapacity;
    }

    public void setPackageCapacity(Integer packageCapacity) {
        this.packageCapacity = packageCapacity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getFoodDetails() {
        return foodDetails;
    }

    public void setFoodDetails(String foodDetails) {
        this.foodDetails = foodDetails;
    }

    public String getAccommodationDetails() {
        return accommodationDetails;
    }

    public void setAccommodationDetails(String accommodationDetails) {
        this.accommodationDetails = accommodationDetails;
    }

    public String getSightseeingDetails() {
        return sightseeingDetails;
    }

    public void setSightseeingDetails(String sightseeingDetails) {
        this.sightseeingDetails = sightseeingDetails;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
