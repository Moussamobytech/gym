package com.gym.controller;

import com.gym.dto.AuthRequest;
import com.gym.dto.AuthResponse;
import com.gym.dto.RegisterRequest;
import com.gym.model.Role;
import com.gym.model.User;
import com.gym.model.PaymentStatus;
import com.gym.repository.UserRepository;
import com.gym.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.gym.service.NotificationService notificationService;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authenticationRequest) throws Exception {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authenticationRequest.getPhoneNumber(), authenticationRequest.getPassword())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getPhoneNumber());
        final String jwt = jwtUtil.generateToken(userDetails);
        
        User user = userRepository.findByPhoneNumber(authenticationRequest.getPhoneNumber()).get();

        return ResponseEntity.ok(new AuthResponse(jwt, user.getQrCodeId(), user.getRole().name()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByPhoneNumber(registerRequest.getPhoneNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Phone number is already in use!");
        }

        User user = new User();
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        
        if (registerRequest.getRole() != null) {
            user.setRole(registerRequest.getRole());
        } else {
            user.setRole(Role.CLIENT);
            if (registerRequest.getManagerQrCodeId() != null) {
                java.util.Optional<User> managerOpt = userRepository.findByQrCodeId(registerRequest.getManagerQrCodeId());
                if (managerOpt.isPresent()) {
                    user.setManagerId(managerOpt.get().getId());
                    // Notify manager
                    notificationService.createAndSendNotification(
                        managerOpt.get(),
                        "Nouvelle Inscription \uD83D\uDCE3",
                        registerRequest.getFirstName() + " vient de s'inscrire ! Pensez à valider sa demande."
                    );
                } else {
                    return ResponseEntity.badRequest().body("Erreur: Code QR de la salle invalide.");
                }
            }
            user.setPaymentStatus(PaymentStatus.PENDING);
            user.setSubscriptionEndDate(LocalDate.now());
        }

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }
}
