package com.otp.touristplanner.service;

import com.otp.touristplanner.dto.PaymentRequest;
import com.otp.touristplanner.entity.Booking;
import com.otp.touristplanner.repository.BookingRepository;
import com.otp.touristplanner.repository.UserRepository;
import com.otp.touristplanner.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public String processPayment(PaymentRequest request, Long userId) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to pay for this booking.");
        }

        if (booking.getPaymentStatus() == Booking.PaymentStatus.PAID) {
            throw new RuntimeException("Booking is already paid.");
        }

        if (booking.getBookingStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking must be confirmed by an Admin before payment.");
        }

        // --- Mock Payment Gateway Logic ---
        // In a real application, this would call Stripe, Razorpay, etc.
        if (request.getCardNumber() == null || request.getCardNumber().length() < 15) {
            booking.setPaymentStatus(Booking.PaymentStatus.FAILED);
            bookingRepository.save(booking);
            throw new RuntimeException("Payment failed: Invalid card number.");
        }
        if (request.getCvv() == null || request.getCvv().length() < 3) {
            booking.setPaymentStatus(Booking.PaymentStatus.FAILED);
            bookingRepository.save(booking);
            throw new RuntimeException("Payment failed: Invalid CVV.");
        }

        // Payment successful
        String cardNum = request.getCardNumber();
        if (cardNum != null && cardNum.length() >= 4) {
            booking.setCardLast4(cardNum.substring(cardNum.length() - 4));
        }
        booking.setPaymentMethod("Credit/Debit Card");

        booking.setPaymentStatus(Booking.PaymentStatus.PAID);
        booking.setBookingStatus(Booking.BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // Award Loyalty Points (1 point per 100 Rs spent, ignoring cents)
        int pointsEarned = (int) (booking.getTotalAmount() / 100);
        User user = booking.getUser();
        user.setLoyaltyPoints(user.getLoyaltyPoints() + pointsEarned);
        userRepository.save(user);

        // Send confirmation email asynchronously (with PDF invoice attached)
        emailService.sendBookingConfirmation(booking);

        // Notify Admin about new revenue
        emailService.sendAdminNewBookingAlert(booking);

        // Send in-app notification
        notificationService.createNotification(booking.getUser(),
                "Payment Successful",
                "Your payment of $" + booking.getTotalAmount() + " for booking #" + booking.getBookingId()
                        + " was successful. Your booking is confirmed!");

        return "Payment processed successfully.";
    }
}
