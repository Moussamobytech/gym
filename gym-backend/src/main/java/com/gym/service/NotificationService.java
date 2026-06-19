package com.gym.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
public class NotificationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String EXPO_PUSH_API_URL = "https://exp.host/--/api/v2/push/send";

    public void sendPushNotification(String to, String title, String body) {
        if (to == null || to.isEmpty()) return;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        Map<String, Object> message = new HashMap<>();
        message.put("to", to);
        message.put("sound", "default");
        message.put("title", title);
        message.put("body", body);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(message, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(EXPO_PUSH_API_URL, request, String.class);
            System.out.println("Notification sent: " + response.getBody());
        } catch (Exception e) {
            System.err.println("Failed to send push notification: " + e.getMessage());
        }
    }
}
