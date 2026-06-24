package com.gym.controller;

import com.gym.model.Notification;
import com.gym.model.User;
import com.gym.repository.NotificationRepository;
import com.gym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByPhoneNumber(userDetails.getUsername());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userOpt.get().getId());
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByPhoneNumber(userDetails.getUsername());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Notification notification = notifOpt.get();
        if (!notification.getRecipient().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        notification.setRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok("Notification marked as read");
    }
}
