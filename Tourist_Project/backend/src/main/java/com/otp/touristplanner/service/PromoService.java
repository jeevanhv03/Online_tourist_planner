package com.otp.touristplanner.service;

import com.otp.touristplanner.entity.PromoCode;
import com.otp.touristplanner.repository.PromoCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PromoService {

    @Autowired
    private PromoCodeRepository promoCodeRepository;

    public PromoCode createPromoCode(PromoCode promoCode) {
        if (promoCodeRepository.findByCodeIgnoreCase(promoCode.getCode()).isPresent()) {
            throw new RuntimeException("Promo code already exists");
        }
        return promoCodeRepository.save(promoCode);
    }

    public List<PromoCode> getAllPromoCodes() {
        return promoCodeRepository.findAll();
    }

    public PromoCode disablePromoCode(Long id) {
        PromoCode code = promoCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promo code not found"));
        code.setActive(false);
        return promoCodeRepository.save(code);
    }

    public PromoCode validatePromoCode(String code) {
        Optional<PromoCode> promoOpt = promoCodeRepository.findByCodeIgnoreCase(code);
        if (promoOpt.isEmpty()) {
            throw new RuntimeException("Invalid promo code");
        }
        PromoCode promo = promoOpt.get();
        if (!promo.isActive()) {
            throw new RuntimeException("This promo code is no longer active");
        }
        if (promo.getValidUntil() != null && promo.getValidUntil().isBefore(LocalDate.now())) {
            throw new RuntimeException("This promo code has expired");
        }
        return promo;
    }
}
