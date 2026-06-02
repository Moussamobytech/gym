package com.gym.controller;

import com.gym.model.CheckIn;
import com.gym.model.Role;
import com.gym.model.User;
import com.gym.repository.CheckInRepository;
import com.gym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CheckInRepository checkInRepository;

    @GetMapping("/members")
    public ResponseEntity<?> getMembers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String phoneNumber = auth.getName();
        Optional<User> managerOpt = userRepository.findByPhoneNumber(phoneNumber);
        
        if (managerOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(userRepository.findByManagerIdAndRole(managerOpt.get().getId(), Role.CLIENT));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> managerOpt = userRepository.findByPhoneNumber(auth.getName());
        
        if (managerOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(managerOpt.get());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody com.gym.dto.UpdateProfileRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> managerOpt = userRepository.findByPhoneNumber(auth.getName());
        
        if (managerOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User manager = managerOpt.get();
        if (request.getFirstName() != null) manager.setFirstName(request.getFirstName());
        if (request.getLastName() != null) manager.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) {
            // Check if phone number is used by someone else
            Optional<User> existing = userRepository.findByPhoneNumber(request.getPhoneNumber());
            if (existing.isPresent() && !existing.get().getId().equals(manager.getId())) {
                return ResponseEntity.badRequest().body("Ce numéro de téléphone est déjà utilisé.");
            }
            manager.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getProfileImageUrl() != null) manager.setProfileImageUrl(request.getProfileImageUrl());

        userRepository.save(manager);
        return ResponseEntity.ok(manager);
    }

    @PostMapping("/checkin/{qrCodeId}")
    public ResponseEntity<?> checkInUser(@PathVariable String qrCodeId) {
        Optional<User> userOpt = userRepository.findByQrCodeId(qrCodeId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            CheckIn checkIn = new CheckIn();
            checkIn.setUser(user);
            checkInRepository.save(checkIn);
            
            return ResponseEntity.ok("Check-in successful for user: " + user.getFirstName() + " " + user.getLastName());
        } else {
            return ResponseEntity.badRequest().body("Invalid QR Code!");
        }
    }
}
