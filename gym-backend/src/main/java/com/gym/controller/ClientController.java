package com.gym.controller;

import com.gym.model.PaymentStatus;
import com.gym.model.User;
import com.gym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.gym.dto.UpdateProfileRequest;

import java.util.Optional;

import com.gym.model.CheckIn;
import com.gym.repository.CheckInRepository;

@RestController
@RequestMapping("/api/client")
public class ClientController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CheckInRepository checkInRepository;

    @PostMapping("/renew")
    public ResponseEntity<?> requestRenewal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> clientOpt = userRepository.findByPhoneNumber(auth.getName());

        if (clientOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Client non trouvé.");
        }

        User client = clientOpt.get();
        client.setPaymentStatus(PaymentStatus.PENDING);
        userRepository.save(client);

        return ResponseEntity.ok("Demande de renouvellement envoyée avec succès.");
    }

    @PostMapping("/checkin")
    public ResponseEntity<?> checkIn() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> clientOpt = userRepository.findByPhoneNumber(auth.getName());

        if (clientOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Client non trouvé.");
        }

        User client = clientOpt.get();

        if (client.getPaymentStatus() != PaymentStatus.PAID) {
            return ResponseEntity.badRequest().body("Accès refusé. Veuillez renouveler votre abonnement.");
        }

        if (client.getSubscriptionEndDate() != null && client.getSubscriptionEndDate().isBefore(java.time.LocalDate.now())) {
            client.setPaymentStatus(PaymentStatus.EXPIRED);
            userRepository.save(client);
            return ResponseEntity.badRequest().body("Votre abonnement a expiré.");
        }

        CheckIn checkIn = new CheckIn();
        checkIn.setUser(client);
        checkInRepository.save(checkIn);

        return ResponseEntity.ok("Bienvenue, accès autorisé !");
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> clientOpt = userRepository.findByPhoneNumber(auth.getName());

        if (clientOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Client non trouvé.");
        }

        User client = clientOpt.get();
        client.setPassword(null); // Ne pas renvoyer le mot de passe
        return ResponseEntity.ok(client);
    }
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> clientOpt = userRepository.findByPhoneNumber(auth.getName());
        
        if (clientOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User client = clientOpt.get();
        if (request.getFirstName() != null) client.setFirstName(request.getFirstName());
        if (request.getLastName() != null) client.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) {
            Optional<User> existing = userRepository.findByPhoneNumber(request.getPhoneNumber());
            if (existing.isPresent() && !existing.get().getId().equals(client.getId())) {
                return ResponseEntity.badRequest().body("Ce numéro de téléphone est déjà utilisé.");
            }
            client.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getProfileImageUrl() != null) client.setProfileImageUrl(request.getProfileImageUrl());

        userRepository.save(client);
        client.setPassword(null);
        return ResponseEntity.ok(client);
    }
}
