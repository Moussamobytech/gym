package com.gym.repository;

import com.gym.model.User;
import com.gym.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhoneNumber(String phoneNumber);
    Optional<User> findByQrCodeId(String qrCodeId);
    List<User> findByManagerIdAndRole(Long managerId, Role role);
}
