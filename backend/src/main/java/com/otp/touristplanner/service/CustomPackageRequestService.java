package com.otp.touristplanner.service;

import com.otp.touristplanner.dto.CustomPackageRequestDTO;
import com.otp.touristplanner.entity.CustomPackageRequest;
import com.otp.touristplanner.entity.User;
import com.otp.touristplanner.repository.CustomPackageRequestRepository;
import com.otp.touristplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomPackageRequestService {

        @Autowired
        private CustomPackageRequestRepository repository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private NotificationService notificationService;

        @Autowired
        private EmailService emailService;

        @Transactional
        public CustomPackageRequestDTO createRequest(Long userId, CustomPackageRequestDTO dto) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                CustomPackageRequest request = new CustomPackageRequest();
                request.setUser(user);
                request.setDestination(dto.getDestination());
                request.setPassengerCount(dto.getPassengerCount());
                request.setStartDate(dto.getStartDate());
                request.setEndDate(dto.getEndDate());
                request.setPreferences(dto.getPreferences());
                request.setStatus(CustomPackageRequest.RequestStatus.PENDING);

                CustomPackageRequest saved = repository.save(request);

                // Notify Admin of new request
                emailService.sendNewCustomRequestAlert(saved);

                return CustomPackageRequestDTO.fromEntity(saved);
        }

        public List<CustomPackageRequestDTO> getUserRequests(Long userId) {
                return repository.findByUserIdOrderByCreatedAtDesc(userId)
                                .stream().map(CustomPackageRequestDTO::fromEntity)
                                .collect(Collectors.toList());
        }

        public List<CustomPackageRequestDTO> getAllRequests() {
                return repository.findAll().stream()
                                .map(CustomPackageRequestDTO::fromEntity)
                                .collect(Collectors.toList());
        }

        @Transactional
        public CustomPackageRequestDTO approveRequest(Long requestId, Double price, String notes) {
                CustomPackageRequest request = repository.findById(requestId)
                                .orElseThrow(() -> new RuntimeException("Request not found"));

                request.setStatus(CustomPackageRequest.RequestStatus.APPROVED);
                request.setPrice(price);
                request.setAdminNotes(notes);

                CustomPackageRequest saved = repository.save(request);

                notificationService.createNotification(request.getUser(),
                                "Custom Trip Approved!",
                                "Your custom trip to " + request.getDestination()
                                                + " has been approved with a price of ₹" + price
                                                + ". You can now confirm and pay from your dashboard.");

                // Send HTML Email to user
                emailService.sendCustomRequestUpdate(saved);

                return CustomPackageRequestDTO.fromEntity(saved);
        }

        @Transactional
        public CustomPackageRequestDTO rejectRequest(Long requestId, String notes) {
                CustomPackageRequest request = repository.findById(requestId)
                                .orElseThrow(() -> new RuntimeException("Request not found"));

                request.setStatus(CustomPackageRequest.RequestStatus.REJECTED);
                request.setAdminNotes(notes);

                CustomPackageRequest saved = repository.save(request);

                notificationService.createNotification(request.getUser(),
                                "Custom Trip Rejected",
                                "We regret to inform you that your custom trip request for " + request.getDestination()
                                                + " was not accepted. Note: " + notes);

                // Send HTML Email to user
                emailService.sendCustomRequestUpdate(saved);

                return CustomPackageRequestDTO.fromEntity(saved);
        }
}
