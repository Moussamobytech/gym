package com.gym.dto;

import com.gym.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String password;
    private Role role;
    private String managerQrCodeId;
}
