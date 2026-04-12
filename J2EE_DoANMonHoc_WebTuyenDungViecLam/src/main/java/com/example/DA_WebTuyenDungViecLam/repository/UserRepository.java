package com.example.DA_WebTuyenDungViecLam.repository;

import com.example.DA_WebTuyenDungViecLam.entity.User;
import com.example.DA_WebTuyenDungViecLam.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    long countByRole(UserRole role);

    Page<User> findByRoleIn(java.util.Collection<UserRole> roles, Pageable pageable);

    @Query(value = "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as cnt " +
           "FROM users WHERE created_at >= :since GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month",
           nativeQuery = true)
    List<Object[]> countByMonth(@Param("since") LocalDateTime since);
}
