package com.otp.touristplanner.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity for tracking sent emails and their status.
 */
@Entity
@Table(name = "email_logs")
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String status; // SUCCESS or FAILED

    @Column(name = "sent_time", nullable = false)
    private LocalDateTime sentTime;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    public EmailLog() {
    }

    public EmailLog(String recipientEmail, String subject, String status, LocalDateTime sentTime, String errorMessage) {
        this.recipientEmail = recipientEmail;
        this.subject = subject;
        this.status = status;
        this.sentTime = sentTime;
        this.errorMessage = errorMessage;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getSentTime() {
        return sentTime;
    }

    public void setSentTime(LocalDateTime sentTime) {
        this.sentTime = sentTime;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
