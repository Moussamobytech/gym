package com.gym.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    @Column(unique = true, nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String qrCodeId;

    @Column(columnDefinition = "LONGTEXT")
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private Long managerId;

    private LocalDate subscriptionEndDate;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private LocalDateTime createdAt;

    @Column(name = "push_token")
    private String pushToken;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (qrCodeId == null) {
            qrCodeId = UUID.randomUUID().toString();
        }
    }
}
