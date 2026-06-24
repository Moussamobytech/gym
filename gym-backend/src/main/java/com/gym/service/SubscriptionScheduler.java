package com.gym.service;

import com.gym.model.User;
import com.gym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class SubscriptionScheduler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    // Run every day at 10 AM (Cron: second, minute, hour, day of month, month, day of week)
    @Scheduled(cron = "0 0 10 * * ?")
    public void notifyExpiringSubscriptions() {
        LocalDate targetDate = LocalDate.now().plusDays(3);
        
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getSubscriptionEndDate() != null && user.getSubscriptionEndDate().isEqual(targetDate)) {
                notificationService.createAndSendNotification(
                    user,
                    "Abonnement bientôt expiré ⏳",
                    "Votre abonnement expire dans 3 jours. Pensez à le renouveler !"
                );
            }
        }
    }
}
