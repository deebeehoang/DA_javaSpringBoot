package com.example.DA_WebTuyenDungViecLam.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedList;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Giới hạn số lượng request: tối đa 100 request/phút mỗi IP.
 * Trả về HTTP 429 nếu vượt quá giới hạn.
 */
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 100;
    private static final long WINDOW_MS = 60_000L;

    private final ConcurrentHashMap<String, LinkedList<Long>> ipRequests = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String ip = extractClientIp(request);
        long now = System.currentTimeMillis();

        ipRequests.putIfAbsent(ip, new LinkedList<>());
        LinkedList<Long> timestamps = ipRequests.get(ip);

        boolean tooMany;
        synchronized (timestamps) {
            timestamps.removeIf(t -> t < now - WINDOW_MS);
            timestamps.add(now);
            tooMany = timestamps.size() > MAX_REQUESTS_PER_MINUTE;
        }

        if (tooMany) {
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"Quá nhiều yêu cầu. Vui lòng thử lại sau.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
