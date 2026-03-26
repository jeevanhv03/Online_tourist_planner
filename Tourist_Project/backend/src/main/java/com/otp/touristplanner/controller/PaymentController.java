package com.otp.touristplanner.controller;

import com.otp.touristplanner.dto.PaymentRequest;
import com.otp.touristplanner.security.UserDetailsImpl;
import com.otp.touristplanner.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            String result = paymentService.processPayment(request, userDetails.getId());
            return ResponseEntity.ok(Map.of("message", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
