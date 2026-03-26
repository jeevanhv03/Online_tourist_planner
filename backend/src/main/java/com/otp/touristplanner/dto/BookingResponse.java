package com.otp.touristplanner.dto;

import com.otp.touristplanner.entity.Booking;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for booking response - flattens nested entity data.
 */
public class BookingResponse {

    private Long bookingId;
    private Long userId;
    private String username;
    private Long packageId;
    private String destinationName;
    private Long vehicleId;
    private String vehicleType;
    private LocalDate travelStartDate;
    private LocalDate travelEndDate;
    private LocalDateTime bookingDate;
    private Integer passengerCount;
    private Double totalAmount;
    private String bookingStatus;
    private String paymentStatus;
    private String specialRequests;

    public BookingResponse() {
    }

    public static BookingResponse fromBooking(Booking b) {
        BookingResponse r = new BookingResponse();
        r.bookingId = b.getBookingId();
        r.userId = b.getUser().getId();
        r.username = b.getUser().getUsername();
        r.packageId = b.getTourPackage().getPackageId();
        r.destinationName = b.getTourPackage().getDestinationName();
        r.vehicleId = b.getVehicle().getVehicleId();
        r.vehicleType = b.getVehicle().getVehicleType();
        r.travelStartDate = b.getTravelStartDate();
        r.travelEndDate = b.getTravelEndDate();
        r.bookingDate = b.getBookingDate();
        r.passengerCount = b.getPassengerCount();
        r.totalAmount = b.getTotalAmount();
        r.bookingStatus = b.getBookingStatus() != null ? b.getBookingStatus().name() : null;
        r.paymentStatus = b.getPaymentStatus() != null ? b.getPaymentStatus().name() : null;
        r.specialRequests = b.getSpecialRequests();
        return r;
    }

    // Getters/Setters
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Long getPackageId() {
        return packageId;
    }

    public void setPackageId(Long packageId) {
        this.packageId = packageId;
    }

    public String getDestinationName() {
        return destinationName;
    }

    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
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

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }
}
