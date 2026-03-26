package com.otp.touristplanner.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "message", "Tourist Planner API is running!",
                "status", "online",
                "frontend_port", "3000",
                "backend_port", "8080");
    }
}
