package com.otp.touristplanner.repository;

import com.otp.touristplanner.entity.CustomPackageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomPackageRequestRepository extends JpaRepository<CustomPackageRequest, Long> {
    List<CustomPackageRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
}
