package com.example.DA_WebTuyenDungViecLam.service.impl;

import com.example.DA_WebTuyenDungViecLam.dto.response.NotificationResponse;
import com.example.DA_WebTuyenDungViecLam.entity.Notification;
import com.example.DA_WebTuyenDungViecLam.entity.User;
import com.example.DA_WebTuyenDungViecLam.enums.NotificationType;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.exception.UnauthorizedException;
import com.example.DA_WebTuyenDungViecLam.repository.NotificationRepository;
import com.example.DA_WebTuyenDungViecLam.repository.UserRepository;
import com.example.DA_WebTuyenDungViecLam.service.EmailService;
import com.example.DA_WebTuyenDungViecLam.service.NotificationService;
import com.example.DA_WebTuyenDungViecLam.service.SseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SseEmitterService sseEmitterService;
    private final EmailService emailService;

    @Override
    public List<NotificationResponse> getNotifications(String email) {
        User user = getUser(email);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public long countUnread(String email) {
        User user = getUser(email);
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(String email, Long notificationId) {
        User user = getUser(email);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Thông báo không tồn tại"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Bạn không có quyền truy cập thông báo này");
        }

        notification.setIsRead(true);
        notification = notificationRepository.save(notification);
        return toResponse(notification);
    }

    @Override
    public void create(Long userId, NotificationType type, String title, String message, String link) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .build();
        notification = notificationRepository.save(notification);

        // Push realtime qua SSE
        sseEmitterService.sendNotification(userId, toResponse(notification));

        // Gửi email thông báo (async)
        emailService.sendNotificationEmail(user.getEmail(), title, message, link);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType() != null ? n.getType().name() : null)
                .title(n.getTitle())
                .message(n.getMessage())
                .link(n.getLink())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null)
                .build();
    }
}
