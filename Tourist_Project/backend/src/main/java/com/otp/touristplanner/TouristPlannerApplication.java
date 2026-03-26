package com.otp.touristplanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main entry point for the Online Tourist Planner application.
 */
@SpringBootApplication
@EnableAsync
public class TouristPlannerApplication {

    public static void main(String[] args) {
        SpringApplication.run(TouristPlannerApplication.class, args);
    }
}
