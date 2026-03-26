package com.otp.touristplanner.service;

import com.otp.touristplanner.entity.Booking;
import com.otp.touristplanner.entity.CustomPackageRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.otp.touristplanner.entity.EmailLog;
import com.otp.touristplanner.repository.EmailLogRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ByteArrayResource;

import java.time.LocalDateTime;

/**
 * Service for sending real-world HTML email notifications.
 * Emails are sent asynchronously to avoid blocking the main thread.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private InvoiceService invoiceService;

    @Value("${app.admin.email:admin@touristplanner.com}")
    private String adminEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Autowired
    private EmailLogRepository emailLogRepository;

    private void logEmail(String recipient, String subject, String status, String errorMessage) {
        try {
            EmailLog log = new EmailLog(recipient, subject, status, LocalDateTime.now(), errorMessage);
            emailLogRepository.save(log);
        } catch (Exception e) {
            logger.error("Failed to save email log to database: {}", e.getMessage());
        }
    }

    /**
     * Sends booking confirmation email with HTML content and PDF invoice.
     */
    @Async
    public void sendBookingConfirmation(Booking booking) {
        if (!isMailEnabled())
            return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(booking.getUser().getEmail());
            helper.setSubject("Trip Confirmed! - Booking #" + booking.getBookingId());

            String htmlContent = """
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                        <h2 style="color: #2c3e50; text-align: center;">🌍 Booking Confirmed!</h2>
                        <p>Dear <strong>%s</strong>,</p>
                        <p>Your journey is officially confirmed! Here is a summary of your trip to <strong>%s</strong>:</p>
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <table style="width: 100%%;">
                                <tr><td><strong>Booking ID:</strong></td><td>#%d</td></tr>
                                <tr><td><strong>Dates:</strong></td><td>%s to %s</td></tr>
                                <tr><td><strong>Passengers:</strong></td><td>%d Pax</td></tr>
                                <tr><td><strong>Vehicle:</strong></td><td>%s</td></tr>
                                <tr style="font-size: 1.1em; color: #27ae60;"><td><strong>Total Amount:</strong></td><td>₹%.2f</td></tr>
                            </table>
                        </div>
                        <p style="text-align: center;">
                            <a href="%s/my-bookings" style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Booking Details</a>
                        </p>
                        <p style="font-size: 0.9em; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                            Please find your invoice attached to this email.<br>
                            Thank you for choosing Online Tourist Planner!
                        </p>
                    </div>
                    """
                    .formatted(
                            frontendUrl,
                            booking.getUser().getUsername(),
                            booking.getTourPackage().getDestinationName(),
                            booking.getBookingId(),
                            booking.getTravelStartDate(),
                            booking.getTravelEndDate(),
                            booking.getPassengerCount(),
                            booking.getVehicle().getVehicleType(),
                            booking.getTotalAmount());

            helper.setText(htmlContent, true);

            // Attach PDF invoice
            byte[] invoicePdf = invoiceService.generateBookingInvoice(booking.getBookingId());
            helper.addAttachment("Invoice_Booking_" + booking.getBookingId() + ".pdf",
                    new ByteArrayResource(invoicePdf));

            mailSender.send(message);
            logEmail(booking.getUser().getEmail(), "Trip Confirmed! - Booking #" + booking.getBookingId(), "SUCCESS",
                    null);
            logger.info("HTMl Booking confirmation sent to: {}", booking.getUser().getEmail());
        } catch (Exception e) {
            logEmail(booking != null && booking.getUser() != null ? booking.getUser().getEmail() : "UNKNOWN",
                    "Trip Confirmed! - Booking #" + (booking != null ? booking.getBookingId() : "UNKNOWN"), "FAILED",
                    e.getMessage());
            logger.error("Failed to send booking email: {}", e.getMessage());
        }
    }

    /**
     * Sends a welcome and verification email upon registration.
     */
    @Async
    public void sendVerificationEmail(String toEmail, String username, String token) {
        if (!isMailEnabled())
            return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Verify Your Account - Online Tourist Planner");

            String htmlContent = """
                    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd;">
                        <h2 style="color: #3498db;">Welcome to the Club! ✈️</h2>
                        <p>Hi %s,</p>
                        <p>We're excited to help you plan your next adventure. Please click the button below to verify your email and activate your account:</p>
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="%s/verify-email?token=%s"
                               style="background: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify My Account</a>
                        </p>
                        <p style="font-size: 0.85em; color: #666;">This link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
                    </div>
                    """
                    .formatted(username, frontendUrl, token);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            logEmail(toEmail, "Verify Your Account - Online Tourist Planner", "SUCCESS", null);
            logger.info("HTML Verification email sent to: {}", toEmail);
        } catch (Exception e) {
            logEmail(toEmail, "Verify Your Account - Online Tourist Planner", "FAILED", e.getMessage());
            logger.error("Failed to send verification email: {}", e.getMessage());
        }
    }

    /**
     * Sends password reset email.
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        if (!isMailEnabled())
            return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Reset Your Password - Online Tourist Planner");

            String htmlContent = """
                    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px;">
                        <h2 style="color: #e74c3c;">Password Reset Request 🛡️</h2>
                        <p>You requested a password reset. Click the button below to set a new password:</p>
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="%s/reset-password?token=%s"
                               style="background: #e74c3c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                        </p>
                        <p>This link is valid for 15 minutes. If you didn't request this, please ignore this email or contact support.</p>
                    </div>
                    """
                    .formatted(frontendUrl, resetToken);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            logEmail(toEmail, "Reset Your Password - Online Tourist Planner", "SUCCESS", null);
            logger.info("HTML Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            logEmail(toEmail, "Reset Your Password - Online Tourist Planner", "FAILED", e.getMessage());
            logger.error("Failed to send reset email: {}", e.getMessage());
        }
    }

    /**
     * Sends a plain confirmation for password change.
     */
    @Async
    public void sendPasswordChangedEmail(String toEmail) {
        if (!isMailEnabled())
            return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Password Changed Successfully - Online Tourist Planner");

            String htmlContent = """
                    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee;">
                        <h2 style="color: #27ae60;">Password Changed 🔐</h2>
                        <p>Your password has been successfully updated. If you did not make this change, please contact support immediately.</p>
                    </div>
                    """;

            helper.setText(htmlContent, true);
            mailSender.send(message);
            logEmail(toEmail, "Password Changed Successfully - Online Tourist Planner", "SUCCESS", null);
            logger.info("Password changed email sent to: {}", toEmail);
        } catch (Exception e) {
            logEmail(toEmail, "Password Changed Successfully - Online Tourist Planner", "FAILED", e.getMessage());
            logger.error("Failed to send password changed email: {}", e.getMessage());
        }
    }

    /**
     * Notify Admin about new Custom Trip Proposals.
     */
    @Async
    public void sendNewCustomRequestAlert(CustomPackageRequest request) {
        if (!isMailEnabled())
            return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(adminEmail);
            helper.setSubject("🚨 New Custom Trip Request: " + request.getDestination());

            String htmlContent = """
                    <div style="font-family: sans-serif; padding: 20px; border: 2px solid #555;">
                        <h3>New Custom Request Received</h3>
                        <p><strong>User:</strong> %s (%s)</p>
                        <p><strong>Destination:</strong> %s</p>
                        <p><strong>Dates:</strong> %s to %s</p>
                        <p><strong>Pax:</strong> %d</p>
                        <p><strong>Preferences:</strong><br>%s</p>
                        <p><a href="%s/admin/custom-requests">Go to Admin Panel to Review</a></p>
                    </div>
                    """.formatted(
                    request.getUser().getUsername(),
                    request.getUser().getEmail(),
                    request.getDestination(),
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getPassengerCount(),
                    request.getPreferences(),
                    frontendUrl);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            logEmail(adminEmail, "🚨 New Custom Trip Request: " + request.getDestination(), "SUCCESS", null);
            logger.info("Admin Alert sent for new custom request ID: {}", request.getId());
        } catch (Exception e) {
            logEmail(adminEmail,
                    "🚨 New Custom Trip Request: " + (request != null ? request.getDestination() : "UNKNOWN"), "FAILED",
                    e.getMessage());
            logger.error("Failed to send admin alert: {}", e.getMessage());
        }
    }

    /**
     * Notify User about Custom Trip Approval/Pricing or Rejection.
     */
    @Async
    public void sendCustomRequestUpdate(CustomPackageRequest request) {
        if (!isMailEnabled())
            return;
        try {
            boolean approved = request.getStatus() == CustomPackageRequest.RequestStatus.APPROVED;
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(request.getUser().getEmail());
            helper.setSubject(
                    approved ? "Good News! Your Custom Trip is Approved" : "Update on Your Custom Trip Request");

            String statusColor = approved ? "#27ae60" : "#c0392b";
            String title = approved ? "✅ Proposal Approved!" : "❌ Proposal Update";
            String body = approved
                    ? "Your request for <strong>" + request.getDestination()
                            + "</strong> has been approved with a price of <strong>₹" + request.getPrice()
                            + "</strong>."
                    : "Your request for <strong>" + request.getDestination()
                            + "</strong> was not accepted at this time.";

            String htmlContent = """
                    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee;">
                        <h2 style="color: %s;">%s</h2>
                        <p>Hi %s,</p>
                        <p>%s</p>
                        <div style="margin: 20px 0; padding: 15px; background: #fdfdfd; border-left: 4px solid %s;">
                            <strong>Admin Notes:</strong><br>
                            <em>%s</em>
                        </div>
                        %s
                    </div>
                    """
                    .formatted(
                            statusColor, title, request.getUser().getUsername(), body, statusColor,
                            request.getAdminNotes() != null ? request.getAdminNotes() : "N/A",
                            approved ? "<p style='text-align: center;'><a href='" + frontendUrl
                                    + "/my-custom-requests' style='background: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Finalize & Book Now</a></p>"
                                    : "");

            helper.setText(htmlContent, true);
            mailSender.send(message);
            logEmail(request.getUser().getEmail(),
                    approved ? "Good News! Your Custom Trip is Approved" : "Update on Your Custom Trip Request",
                    "SUCCESS", null);
            logger.info("Custom request update email sent to: {}", request.getUser().getEmail());
        } catch (Exception e) {
            logEmail(request != null && request.getUser() != null ? request.getUser().getEmail() : "UNKNOWN",
                    "Update on Your Custom Trip Request", "FAILED", e.getMessage());
            logger.error("Failed to send custom request update: {}", e.getMessage());
        }
    }

    @Async
    public void sendProfileUpdatedEmail(String toEmail, String username) {
        if (!isMailEnabled())
            return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Profile Updated Successfully - Online Tourist Planner");

            String htmlContent = """
                    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee;">
                        <h2 style="color: #3498db;">Profile Updated ✨</h2>
                        <p>Hi %s,</p>
                        <p>Your profile information has been successfully updated. If you did not make this change, please contact our support team immediately.</p>
                        <p style="text-align: center; margin-top: 20px;">
                            <a href="%s/my-profile" style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View My Profile</a>
                        </p>
                    </div>
                    """
                    .formatted(username, frontendUrl);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            logEmail(toEmail, "Profile Updated Successfully - Online Tourist Planner", "SUCCESS", null);
            logger.info("Profile updated email sent to: {}", toEmail);
        } catch (Exception e) {
            logEmail(toEmail, "Profile Updated Successfully - Online Tourist Planner", "FAILED", e.getMessage());
            logger.error("Failed to send profile updated email: {}", e.getMessage());
        }
    }

    /**
     * Notify Admin about new successful bookings.
     */
    @Async
    public void sendAdminNewBookingAlert(Booking booking) {
        if (!isMailEnabled())
            return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(adminEmail);
            helper.setSubject("💰 Revenue Alert! New Booking: #" + booking.getBookingId());

            String htmlContent = """
                    <div style="font-family: sans-serif; padding: 20px; border: 2px solid #27ae60;">
                        <h3 style="color: #27ae60;">New Successful Booking!</h3>
                        <p><strong>Customer:</strong> %s (%s)</p>
                        <p><strong>Destination:</strong> %s</p>
                        <p><strong>Total Amount:</strong> ₹%.2f</p>
                        <p><strong>Dates:</strong> %s to %s</p>
                        <p><strong>Pax:</strong> %d</p>
                        <p><a href="%s/admin/bookings">View in Admin Panel</a></p>
                    </div>
                    """.formatted(
                    booking.getUser().getUsername(),
                    booking.getUser().getEmail(),
                    booking.getTourPackage().getDestinationName(),
                    booking.getTotalAmount(),
                    booking.getTravelStartDate(),
                    booking.getTravelEndDate(),
                    booking.getPassengerCount(),
                    frontendUrl);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            logEmail(adminEmail, "💰 Revenue Alert! New Booking: #" + booking.getBookingId(), "SUCCESS", null);
            logger.info("Admin Alert sent for new payment confirmed: Booking #{}", booking.getBookingId());
        } catch (Exception e) {
            logEmail(adminEmail,
                    "💰 Revenue Alert! New Booking: #" + (booking != null ? booking.getBookingId() : "UNKNOWN"),
                    "FAILED", e.getMessage());
            logger.error("Failed to send admin booking alert: {}", e.getMessage());
        }
    }

    private boolean isMailEnabled() {
        if (mailSender == null) {
            logger.warn("Mail sender not initialized. Check your application.properties SMTP settings.");
            return false;
        }
        return true;
    }
}
