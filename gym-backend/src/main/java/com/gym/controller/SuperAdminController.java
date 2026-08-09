package com.gym.controller;

import com.gym.model.Role;
import com.gym.model.User;
import com.gym.model.PaymentStatus;
import com.gym.repository.CheckInRepository;
import com.gym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin")
public class SuperAdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CheckInRepository checkInRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody com.gym.dto.RegisterRequest request) {
        if (userRepository.findByPhoneNumber(request.getPhoneNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("Ce numéro de téléphone est déjà utilisé");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // If a managerQrCodeId is provided, this is a CLIENT linked to a MANAGER
        if (request.getManagerQrCodeId() != null && !request.getManagerQrCodeId().isEmpty()) {
            Optional<User> managerOpt = userRepository.findByQrCodeId(request.getManagerQrCodeId());
            if (managerOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Manager introuvable pour ce QR Code");
            }
            user.setRole(Role.CLIENT);
            user.setManagerId(managerOpt.get().getId());
            user.setPaymentStatus(PaymentStatus.PENDING);
            user.setSubscriptionEndDate(LocalDate.now());
        } else {
            // Otherwise, we create a new MANAGER
            user.setRole(Role.MANAGER);
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Utilisateur introuvable.");
        }
        
        User user = userOpt.get();
        if (user.getRole() == Role.SUPER_ADMIN) {
            return ResponseEntity.badRequest().body("Impossible de supprimer un Super Admin.");
        }

        // Delete check-ins associated with this user
        checkInRepository.deleteByUserId(user.getId());

        // If it's a manager, we might need to delete or detach all their clients
        if (user.getRole() == Role.MANAGER) {
            List<User> clients = userRepository.findByManagerIdAndRole(user.getId(), Role.CLIENT);
            for (User client : clients) {
                checkInRepository.deleteByUserId(client.getId());
                userRepository.delete(client);
            }
        }

        userRepository.delete(user);
        return ResponseEntity.ok("Utilisateur supprimé avec succès.");
    }
}
