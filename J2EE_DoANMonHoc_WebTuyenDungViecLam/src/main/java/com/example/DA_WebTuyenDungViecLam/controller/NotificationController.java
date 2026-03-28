package com.example.DA_WebTuyenDungViecLam.controller;

import com.example.DA_WebTuyenDungViecLam.dto.response.ApiResponse;
import com.example.DA_WebTuyenDungViecLam.dto.response.NotificationResponse;
import com.example.DA_WebTuyenDungViecLam.entity.User;
import com.example.DA_WebTuyenDungViecLam.exception.ResourceNotFoundException;
import com.example.DA_WebTuyenDungViecLam.repository.UserRepository;
import com.example.DA_WebTuyenDungViecLam.security.JwtUtil;
import com.example.DA_WebTuyenDungViecLam.service.NotificationService;
import com.example.DA_WebTuyenDungViecLam.service.SseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final SseEmitterService sseEmitterService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getNotifications(auth.getName())));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.countUnread(auth.getName())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            Authentication auth,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.markAsRead(auth.getName(), id)));
    }

    /**
     * SSE endpoint - EventSource không hỗ trợ custom header nên auth qua query param token.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new ResourceNotFoundException("Token không hợp lệ");
        }
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        return sseEmitterService.createEmitter(user.getId());
    }
}
