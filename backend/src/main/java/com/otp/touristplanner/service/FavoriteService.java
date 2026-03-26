package com.otp.touristplanner.service;

import com.otp.touristplanner.dto.FavoriteDTO;
import com.otp.touristplanner.entity.Favorite;
import com.otp.touristplanner.entity.TourPackage;
import com.otp.touristplanner.entity.User;
import com.otp.touristplanner.repository.FavoriteRepository;
import com.otp.touristplanner.repository.PackageRepository;
import com.otp.touristplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PackageRepository packageRepository;

    @Transactional
    public FavoriteDTO addFavorite(Long userId, Long packageId) {
        if (favoriteRepository.existsByUserIdAndTourPackagePackageId(userId, packageId)) {
            throw new RuntimeException("Package is already in favorites");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        TourPackage tourPackage = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        Favorite favorite = new Favorite(user, tourPackage);
        return FavoriteDTO.fromFavorite(favoriteRepository.save(favorite));
    }

    @Transactional
    public void removeFavorite(Long userId, Long packageId) {
        Favorite favorite = favoriteRepository.findByUserIdAndTourPackagePackageId(userId, packageId)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));
        favoriteRepository.delete(favorite);
    }

    public List<FavoriteDTO> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId)
                .stream().map(FavoriteDTO::fromFavorite).collect(Collectors.toList());
    }

    public boolean isFavorite(Long userId, Long packageId) {
        return favoriteRepository.existsByUserIdAndTourPackagePackageId(userId, packageId);
    }
}
