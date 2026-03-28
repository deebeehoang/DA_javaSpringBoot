package com.example.DA_WebTuyenDungViecLam.service.impl;

import com.example.DA_WebTuyenDungViecLam.dto.request.LoginRequest;
import com.example.DA_WebTuyenDungViecLam.dto.request.RegisterRequest;
import com.example.DA_WebTuyenDungViecLam.dto.response.AuthResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.UserResponse;
import com.example.DA_WebTuyenDungViecLam.entity.Candidate;
import com.example.DA_WebTuyenDungViecLam.entity.Employer;
import com.example.DA_WebTuyenDungViecLam.entity.User;
import com.example.DA_WebTuyenDungViecLam.enums.AuthProvider;
import com.example.DA_WebTuyenDungViecLam.enums.UserRole;
import com.example.DA_WebTuyenDungViecLam.enums.UserStatus;
import com.example.DA_WebTuyenDungViecLam.exception.DuplicateResourceException;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.exception.UnauthorizedException;
import com.example.DA_WebTuyenDungViecLam.repository.CandidateRepository;
import com.example.DA_WebTuyenDungViecLam.repository.EmployerRepository;
import com.example.DA_WebTuyenDungViecLam.repository.UserRepository;
import com.example.DA_WebTuyenDungViecLam.security.JwtUtil;
import com.example.DA_WebTuyenDungViecLam.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final EmployerRepository employerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email đã được sử dụng");
        }

        UserRole role = UserRole.valueOf(request.getRole().toUpperCase());

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(role)
                .status(UserStatus.ACTIVE)
                .authProvider(AuthProvider.LOCAL)
                .isOnline(false)
                .build();

        user = userRepository.save(user);

        // Tạo profile tương ứng
        if (role == UserRole.CANDIDATE) {
            candidateRepository.save(Candidate.builder().user(user).build());
        } else if (role == UserRole.EMPLOYER) {
            Employer employer = Employer.builder()
                    .user(user)
                    .companyName(request.getCompanyName())
                    .isVerified(false)
                    .build();
            employerRepository.save(employer);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(toUserResponse(user))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Mật khẩu không chính xác");
        }

        if (user.getStatus() == UserStatus.BANNED) {
            throw new UnauthorizedException("Tài khoản đã bị khóa");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(toUserResponse(user))
                .build();
    }

    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
