package com.otp.touristplanner.repository;

import com.otp.touristplanner.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserId(Long userId);

    Optional<Favorite> findByUserIdAndTourPackagePackageId(Long userId, Long packageId);

    boolean existsByUserIdAndTourPackagePackageId(Long userId, Long packageId);
}
