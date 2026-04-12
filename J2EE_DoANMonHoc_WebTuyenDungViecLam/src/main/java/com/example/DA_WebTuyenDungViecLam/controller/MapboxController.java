package com.example.DA_WebTuyenDungViecLam.controller;

import com.example.DA_WebTuyenDungViecLam.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/mapbox")
public class MapboxController {

    @Value("${mapbox.access-token}")
    private String accessToken;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Geocode using Nominatim (OpenStreetMap) – much better for Vietnamese addresses.
     * Response is transformed to match the Mapbox-style format the frontend expects.
     */
    @GetMapping("/geocode")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ApiResponse<Object>> geocode(@RequestParam String q) {
        String encoded = URLEncoder.encode(q.trim(), StandardCharsets.UTF_8);
        String url = "https://nominatim.openstreetmap.org/search?q=" + encoded
                + "&format=json&addressdetails=1&countrycodes=vn&limit=5&accept-language=vi";

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "JobRecruitmentApp/1.0");

        ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET,
                new HttpEntity<>(headers), List.class);

        List<Map<String, Object>> nominatimResults = response.getBody();
        if (nominatimResults == null) nominatimResults = List.of();

        // Transform Nominatim results to Mapbox-compatible format
        List<Map<String, Object>> features = new ArrayList<>();
        for (Map<String, Object> item : nominatimResults) {
            Map<String, Object> feature = new HashMap<>();
            feature.put("id", "nominatim-" + item.get("place_id"));
            feature.put("place_name", item.get("display_name"));

            double lon = Double.parseDouble(String.valueOf(item.get("lon")));
            double lat = Double.parseDouble(String.valueOf(item.get("lat")));
            feature.put("center", List.of(lon, lat));

            // Build context from address details for city extraction
            Map<String, Object> address = (Map<String, Object>) item.get("address");
            if (address != null) {
                List<Map<String, String>> context = new ArrayList<>();
                String city = (String) address.getOrDefault("city",
                        address.getOrDefault("town",
                                address.getOrDefault("province", null)));
                if (city != null) {
                    context.add(Map.of("id", "place.1", "text", city));
                }
                String region = (String) address.get("state");
                if (region != null) {
                    context.add(Map.of("id", "region.1", "text", region));
                }
                feature.put("context", context);
            }

            features.add(feature);
        }

        return ResponseEntity.ok(ApiResponse.success(features));
    }

    @GetMapping("/token")
    public ResponseEntity<ApiResponse<String>> getToken() {
        return ResponseEntity.ok(ApiResponse.success(accessToken));
    }
}
