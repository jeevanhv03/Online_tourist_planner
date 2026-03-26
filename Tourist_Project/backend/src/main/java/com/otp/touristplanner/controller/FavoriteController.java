package com.otp.touristplanner.controller;

import com.otp.touristplanner.dto.FavoriteDTO;
import com.otp.touristplanner.security.UserDetailsImpl;
import com.otp.touristplanner.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @PostMapping("/{packageId}")
    public ResponseEntity<?> addFavorite(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long packageId) {
        try {
            FavoriteDTO favorite = favoriteService.addFavorite(userDetails.getId(), packageId);
            return ResponseEntity.ok(favorite);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{packageId}")
    public ResponseEntity<?> removeFavorite(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long packageId) {
        try {
            favoriteService.removeFavorite(userDetails.getId(), packageId);
            return ResponseEntity.ok(Map.of("message", "Removed from favorites successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<FavoriteDTO>> getUserFavorites(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(favoriteService.getUserFavorites(userDetails.getId()));
    }

    @GetMapping("/check/{packageId}")
    public ResponseEntity<Map<String, Boolean>> checkFavoriteStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long packageId) {
        if (userDetails == null) {
            return ResponseEntity.ok(Map.of("isFavorite", false));
        }
        boolean isFavorite = favoriteService.isFavorite(userDetails.getId(), packageId);
        return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
    }
}
