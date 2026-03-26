package com.otp.touristplanner.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Booking entity linking Users, Packages and Vehicles.
 */
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private TourPackage tourPackage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private LocalDate travelStartDate;

    @Column(nullable = false)
    private LocalDate travelEndDate;

    @Column(name = "booking_date")
    private LocalDateTime bookingDate;

    @Column(nullable = false)
    private Integer passengerCount;

    @Column(nullable = false)
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus bookingStatus;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Column(columnDefinition = "TEXT")
    private String specialRequests;

    private String cardLast4;
    private String paymentMethod;
    private String promoCodeApplied;
    private Double discountAmount;

    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED, COMPLETED
    }

    public enum PaymentStatus {
        PENDING, PAID, REFUNDED, FAILED
    }

    public Booking() {
    }

    @PrePersist
    protected void onCreate() {
        bookingDate = LocalDateTime.now();
    }

    // Builder
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private User user;
        private TourPackage tourPackage;
        private Vehicle vehicle;
        private LocalDate travelStartDate, travelEndDate;
        private Integer passengerCount;
        private Double totalAmount;
        private BookingStatus bookingStatus = BookingStatus.PENDING;
        private PaymentStatus paymentStatus = PaymentStatus.PENDING;
        private String specialRequests;
        private String promoCodeApplied;
        private Double discountAmount;

        public Builder user(User v) {
            this.user = v;
            return this;
        }

        public Builder tourPackage(TourPackage v) {
            this.tourPackage = v;
            return this;
        }

        public Builder vehicle(Vehicle v) {
            this.vehicle = v;
            return this;
        }

        public Builder travelStartDate(LocalDate v) {
            this.travelStartDate = v;
            return this;
        }

        public Builder travelEndDate(LocalDate v) {
            this.travelEndDate = v;
            return this;
        }

        public Builder passengerCount(Integer v) {
            this.passengerCount = v;
            return this;
        }

        public Builder totalAmount(Double v) {
            this.totalAmount = v;
            return this;
        }

        public Builder bookingStatus(BookingStatus v) {
            this.bookingStatus = v;
            return this;
        }

        public Builder paymentStatus(PaymentStatus v) {
            this.paymentStatus = v;
            return this;
        }

        public Builder specialRequests(String v) {
            this.specialRequests = v;
            return this;
        }

        public Builder promoCodeApplied(String v) {
            this.promoCodeApplied = v;
            return this;
        }

        public Builder discountAmount(Double v) {
            this.discountAmount = v;
            return this;
        }

        public Booking build() {
            Booking b = new Booking();
            b.user = user;
            b.tourPackage = tourPackage;
            b.vehicle = vehicle;
            b.travelStartDate = travelStartDate;
            b.travelEndDate = travelEndDate;
            b.passengerCount = passengerCount;
            b.totalAmount = totalAmount;
            b.bookingStatus = bookingStatus;
            b.paymentStatus = paymentStatus;
            b.specialRequests = specialRequests;
            b.promoCodeApplied = promoCodeApplied;
            b.discountAmount = discountAmount;
            return b;
        }
    }

    // Getters/Setters
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public TourPackage getTourPackage() {
        return tourPackage;
    }

    public void setTourPackage(TourPackage tourPackage) {
        this.tourPackage = tourPackage;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public LocalDate getTravelStartDate() {
        return travelStartDate;
    }

    public void setTravelStartDate(LocalDate travelStartDate) {
        this.travelStartDate = travelStartDate;
    }

    public LocalDate getTravelEndDate() {
        return travelEndDate;
    }

    public void setTravelEndDate(LocalDate travelEndDate) {
        this.travelEndDate = travelEndDate;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }

    public Integer getPassengerCount() {
        return passengerCount;
    }

    public void setPassengerCount(Integer passengerCount) {
        this.passengerCount = passengerCount;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BookingStatus getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(BookingStatus bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }

    public String getCardLast4() {
        return cardLast4;
    }

    public void setCardLast4(String cardLast4) {
        this.cardLast4 = cardLast4;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPromoCodeApplied() {
        return promoCodeApplied;
    }

    public void setPromoCodeApplied(String promoCodeApplied) {
        this.promoCodeApplied = promoCodeApplied;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
    }
}
