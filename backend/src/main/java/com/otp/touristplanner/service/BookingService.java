package com.otp.touristplanner.service;

import com.otp.touristplanner.dto.BookingRequest;
import com.otp.touristplanner.dto.BookingResponse;
import com.otp.touristplanner.entity.*;
import com.otp.touristplanner.repository.BookingRepository;
import com.otp.touristplanner.repository.CustomPackageRequestRepository;
import com.otp.touristplanner.repository.UserRepository;
import com.otp.touristplanner.repository.VehicleScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing package bookings.
 * Enforces vehicle availability constraints.
 */
@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private VehicleScheduleRepository vehicleScheduleRepository;
    @Autowired
    private PackageService packageService;
    @Autowired
    private VehicleService vehicleService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private CustomPackageRequestRepository customPackageRequestRepository;
    @Autowired
    private PromoService promoService;

    /**
     * Creates a booking after validating vehicle availability.
     */
    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        LocalDate startDate = LocalDate.parse(request.getTravelStartDate());
        LocalDate endDate = LocalDate.parse(request.getTravelEndDate());

        Vehicle vehicle;
        if (request.getVehicleId() == null) {
            vehicle = vehicleService.autoAssignVehicle(startDate, endDate, request.getPassengerCount());
        } else {
            // Validate vehicle availability
            if (!vehicleService.isVehicleAvailable(request.getVehicleId(), startDate, endDate)) {
                throw new RuntimeException(
                        "Vehicle is not available for the selected dates. Please choose another dates.");
            }
            vehicle = vehicleService.getVehicleById(request.getVehicleId());
            if (vehicle.getCapacity() < request.getPassengerCount()) {
                throw new RuntimeException(
                        "Selected vehicle capacity (" + vehicle.getCapacity() + ") is less than the passenger count.");
            }
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        TourPackage pkg = packageService.getPackageById(request.getPackageId());

        // Calculate base amount
        long days = endDate.toEpochDay() - startDate.toEpochDay();
        double vehicleCost = vehicle.getChargePerKm() * 100 * days; // Estimated 100km/day
        double miscCost = vehicle.getMiscCharges() != null ? vehicle.getMiscCharges() : 0;
        double baseAmount = (pkg.getPrice() * request.getPassengerCount()) + vehicleCost + miscCost;

        double discountAmount = 0.0;
        String appliedPromo = null;

        // Apply Promo Code
        if (request.getPromoCode() != null && !request.getPromoCode().trim().isEmpty()) {
            PromoCode promo = promoService.validatePromoCode(request.getPromoCode());
            double calcDiscount = baseAmount * (promo.getDiscountPercentage() / 100.0);
            if (promo.getMaxDiscountAmount() != null && calcDiscount > promo.getMaxDiscountAmount()) {
                calcDiscount = promo.getMaxDiscountAmount();
            }
            discountAmount += calcDiscount;
            appliedPromo = promo.getCode();
        }

        // Redeem Points (1 point = 1 Rupee discount)
        if (request.isRedeemPoints() && user.getLoyaltyPoints() > 0) {
            double pointsDiscount = user.getLoyaltyPoints();
            if (pointsDiscount > (baseAmount - discountAmount)) {
                pointsDiscount = baseAmount - discountAmount;
            }
            discountAmount += pointsDiscount;

            // Deduct points from user immediately (or we could wait until payment, but
            // booking reserves it)
            user.setLoyaltyPoints(user.getLoyaltyPoints() - (int) pointsDiscount);
            userRepository.save(user);
        }

        double totalAmount = baseAmount - discountAmount;

        Booking booking = Booking.builder()
                .user(user)
                .tourPackage(pkg)
                .vehicle(vehicle)
                .travelStartDate(startDate)
                .travelEndDate(endDate)
                .passengerCount(request.getPassengerCount())
                .totalAmount(totalAmount)
                .bookingStatus(Booking.BookingStatus.PENDING)
                .paymentStatus(Booking.PaymentStatus.PENDING)
                .specialRequests(request.getSpecialRequests())
                .promoCodeApplied(appliedPromo)
                .discountAmount(discountAmount)
                .build();

        Booking saved = bookingRepository.save(booking);

        // Add to Vehicle Schedule
        VehicleSchedule schedule = new VehicleSchedule();
        schedule.setVehicle(vehicle);
        schedule.setTourPackage(pkg);
        schedule.setBooking(saved);
        schedule.setStartDate(startDate);
        schedule.setEndDate(endDate);
        schedule.setNotes("Scheduled for booking #" + saved.getBookingId());
        vehicleScheduleRepository.save(schedule);

        // Note: Confirmation email and in-app notifications
        // will be dispatched by PaymentService once the simulated payment is completed.

        return BookingResponse.fromBooking(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByBookingDateDesc(userId)
                .stream().map(BookingResponse::fromBooking).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream().map(BookingResponse::fromBooking).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        return BookingResponse.fromBooking(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }
        booking.setBookingStatus(Booking.BookingStatus.CANCELLED);
        booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
        Booking cancelled = bookingRepository.save(booking);

        // Send in-app notification
        notificationService.createNotification(booking.getUser(),
                "Booking Cancelled",
                "Your booking for " + booking.getTourPackage().getDestinationName()
                        + " has been cancelled and refunded.");

        return BookingResponse.fromBooking(cancelled);
    }

    @Transactional
    public BookingResponse confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setBookingStatus(Booking.BookingStatus.CONFIRMED);
        Booking saved = bookingRepository.save(booking);

        notificationService.createNotification(booking.getUser(),
                "Booking Confirmed by Admin",
                "Your booking for " + booking.getTourPackage().getDestinationName() + " (ID: #" + bookingId
                        + ") has been officially confirmed by the administrator.");

        return BookingResponse.fromBooking(saved);
    }

    @Transactional
    public BookingResponse rejectBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setBookingStatus(Booking.BookingStatus.CANCELLED);
        if (booking.getPaymentStatus() == Booking.PaymentStatus.PAID) {
            booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
        }

        Booking saved = bookingRepository.save(booking);

        notificationService.createNotification(booking.getUser(),
                "Booking Rejected",
                "We regret to inform you that your booking for " + booking.getTourPackage().getDestinationName()
                        + " (ID: #" + bookingId
                        + ") was rejected by the administrator. Any payments made will be refunded.");

        return BookingResponse.fromBooking(saved);
    }

    @Transactional
    public BookingResponse convertCustomToBooking(Long requestId, Long userId, Long vehicleId) {
        CustomPackageRequest request = customPackageRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Custom request not found"));

        if (!request.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (request.getStatus() != CustomPackageRequest.RequestStatus.APPROVED) {
            throw new RuntimeException("Request is not approved by admin yet.");
        }

        // Create a one-off package or just link to null (But our schema requires a
        // package)
        // For simplicity, let's create a "Custom Package" entry for this booking
        TourPackage customPkg = TourPackage.builder()
                .destinationName(request.getDestination() + " (Custom)")
                .numberOfDays((int) (request.getEndDate().toEpochDay() - request.getStartDate().toEpochDay()))
                .numberOfNights((int) (request.getEndDate().toEpochDay() - request.getStartDate().toEpochDay()) - 1)
                .packageCapacity(request.getPassengerCount())
                .price(request.getPrice() / request.getPassengerCount()) // Back-calculate per pax
                .description(request.getPreferences())
                .active(false) // Not public
                .build();
        TourPackage savedPkg = packageService.createPackage(customPkg);

        // Now create booking
        Booking booking = Booking.builder()
                .user(request.getUser())
                .tourPackage(savedPkg)
                .vehicle(vehicleService.getVehicleById(vehicleId))
                .travelStartDate(request.getStartDate())
                .travelEndDate(request.getEndDate())
                .passengerCount(request.getPassengerCount())
                .totalAmount(request.getPrice())
                .bookingStatus(Booking.BookingStatus.CONFIRMED) // Pre-confirmed since admin approved the custom request
                .paymentStatus(Booking.PaymentStatus.PENDING)
                .specialRequests(request.getPreferences())
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        request.setStatus(CustomPackageRequest.RequestStatus.CONVERTED_TO_BOOKING);
        customPackageRequestRepository.save(request);

        return BookingResponse.fromBooking(savedBooking);
    }
}
