package com.otp.touristplanner.controller;

import com.otp.touristplanner.service.ItineraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/itinerary")
@CrossOrigin(origins = "*", exposedHeaders = "Content-Disposition")
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    @GetMapping("/download/{packageId}")
    public ResponseEntity<byte[]> downloadItinerary(@PathVariable Long packageId) {
        try {
            byte[] contents = itineraryService.generatePackageItinerary(packageId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment()
                    .filename("Itinerary_PKG-" + packageId + ".pdf")
                    .build());
            headers.add("Access-Control-Expose-Headers", "Content-Disposition");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(contents);
        } catch (Exception e) {
            System.err.println("DEBUG: Error generating itinerary for package " + packageId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(("Error: " + e.getMessage()).getBytes());
        }
    }
}
