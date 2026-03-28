package com.example.DA_WebTuyenDungViecLam.controller;

import com.example.DA_WebTuyenDungViecLam.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/mapbox")
public class MapboxController {

    @Value("${mapbox.access-token}")
    private String accessToken;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/geocode")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ApiResponse<Object>> geocode(@RequestParam String q) {
        String encoded = URLEncoder.encode(q.trim(), StandardCharsets.UTF_8);
        String url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + encoded
                + ".json?access_token=" + accessToken
                + "&country=vn&language=vi&limit=5&types=address,poi,place,locality,neighborhood";

        Map<String, Object> result = restTemplate.getForObject(url, Map.class);
        Object features = result != null ? result.get("features") : java.util.List.of();
        return ResponseEntity.ok(ApiResponse.success(features));
    }
}
