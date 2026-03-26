package com.otp.touristplanner.repository;

import com.otp.touristplanner.entity.SystemNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<SystemNotification, Long> {
    List<SystemNotification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<SystemNotification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    Long countByUserIdAndIsReadFalse(Long userId);
}
