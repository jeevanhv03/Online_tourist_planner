package com.otp.touristplanner.controller;

import com.otp.touristplanner.dto.CustomPackageRequestDTO;
import com.otp.touristplanner.security.UserDetailsImpl;
import com.otp.touristplanner.service.CustomPackageRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/custom-requests")
@CrossOrigin(origins = "*")
public class CustomPackageRequestController {

    @Autowired
    private CustomPackageRequestService service;

    @PostMapping
    public ResponseEntity<?> createRequest(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CustomPackageRequestDTO dto) {
        return ResponseEntity.ok(service.createRequest(userDetails.getId(), dto));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyRequests(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(service.getUserRequests(userDetails.getId()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllRequests() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Double price = Double.valueOf(payload.get("price").toString());
        String notes = payload.getOrDefault("notes", "").toString();
        return ResponseEntity.ok(service.approveRequest(id, price, notes));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String notes = payload.getOrDefault("notes", "").toString();
        return ResponseEntity.ok(service.rejectRequest(id, notes));
    }
}
