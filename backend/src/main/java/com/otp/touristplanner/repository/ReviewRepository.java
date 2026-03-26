package com.otp.touristplanner.repository;

import com.otp.touristplanner.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTourPackagePackageIdAndIsVisibleTrue(Long packageId);

    List<Review> findByTourPackagePackageId(Long packageId);

    List<Review> findByUserUsername(String username);
}
