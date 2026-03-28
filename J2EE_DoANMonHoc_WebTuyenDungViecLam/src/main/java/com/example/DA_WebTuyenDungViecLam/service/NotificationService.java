package com.example.DA_WebTuyenDungViecLam.service;

import com.example.DA_WebTuyenDungViecLam.dto.response.NotificationResponse;
import com.example.DA_WebTuyenDungViecLam.enums.NotificationType;
import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getNotifications(String email);
    long countUnread(String email);
    NotificationResponse markAsRead(String email, Long notificationId);
    void create(Long userId, NotificationType type, String title, String message, String link);
}
