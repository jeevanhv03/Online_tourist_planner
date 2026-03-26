package com.otp.touristplanner.controller;

import com.otp.touristplanner.entity.PromoCode;
import com.otp.touristplanner.service.PromoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/promos")
@CrossOrigin(origins = "*")
public class PromoController {

    @Autowired
    private PromoService promoService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPromoCode(@RequestBody PromoCode promoCode) {
        try {
            return ResponseEntity.ok(promoService.createPromoCode(promoCode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPromoCodes() {
        return ResponseEntity.ok(promoService.getAllPromoCodes());
    }

    @PatchMapping("/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> disablePromoCode(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(promoService.disablePromoCode(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/validate")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> validatePromoCode(@RequestParam String code) {
        try {
            return ResponseEntity.ok(promoService.validatePromoCode(code));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
