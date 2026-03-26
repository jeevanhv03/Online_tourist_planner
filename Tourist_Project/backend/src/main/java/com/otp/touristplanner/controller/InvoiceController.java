package com.otp.touristplanner.controller;

import com.otp.touristplanner.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*", exposedHeaders = "Content-Disposition")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping("/download/{bookingId}")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long bookingId) {
        try {
            byte[] pdf = invoiceService.generateBookingInvoice(bookingId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            // Use setContentDisposition for modern Spring versions
            headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment()
                    .filename("Invoice_BK-" + bookingId + ".pdf")
                    .build());
            headers.add("Access-Control-Expose-Headers", "Content-Disposition");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdf);
        } catch (Exception e) {
            System.err.println("DEBUG: Error generating invoice for booking " + bookingId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(("Error: " + e.getMessage()).getBytes());
        }
    }
}
