package com.otp.touristplanner.dto;

import com.otp.touristplanner.entity.Favorite;

import java.time.LocalDateTime;

public class FavoriteDTO {
    private Long favoriteId;
    private Long packageId;
    private String destinationName;
    private Double price;
    private String imageUrl;
    private LocalDateTime addedAt;

    public static FavoriteDTO fromFavorite(Favorite favorite) {
        FavoriteDTO dto = new FavoriteDTO();
        dto.setFavoriteId(favorite.getFavoriteId());
        dto.setPackageId(favorite.getTourPackage().getPackageId());
        dto.setDestinationName(favorite.getTourPackage().getDestinationName());
        dto.setPrice(favorite.getTourPackage().getPrice());
        dto.setImageUrl(favorite.getTourPackage().getImageUrl());
        dto.setAddedAt(favorite.getAddedAt());
        return dto;
    }

    // Getters and Setters
    public Long getFavoriteId() {
        return favoriteId;
    }

    public void setFavoriteId(Long favoriteId) {
        this.favoriteId = favoriteId;
    }

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

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}
