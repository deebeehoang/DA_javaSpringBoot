package com.example.DA_WebTuyenDungViecLam.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp");

    private static final Set<String> ALLOWED_CV_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    private static final long MAX_AVATAR_SIZE = 5 * 1024 * 1024;  // 5MB
    private static final long MAX_CV_SIZE = 10 * 1024 * 1024;     // 10MB

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir, "avatars"));
            Files.createDirectories(Paths.get(uploadDir, "cvs"));
            log.info("Upload directories created: {}", uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Không thể tạo thư mục upload", e);
        }
    }

    public String uploadAvatar(MultipartFile file) {
        validateFile(file, ALLOWED_IMAGE_TYPES, MAX_AVATAR_SIZE, "Avatar");
        return saveFile(file, "avatars");
    }

    public String uploadCV(MultipartFile file) {
        validateFile(file, ALLOWED_CV_TYPES, MAX_CV_SIZE, "CV");
        return saveFile(file, "cvs");
    }

    private void validateFile(MultipartFile file, Set<String> allowedTypes, long maxSize, String fileLabel) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException(fileLabel + " file không được để trống");
        }
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException(fileLabel + " vượt quá kích thước cho phép (" + (maxSize / 1024 / 1024) + "MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new IllegalArgumentException(fileLabel + " định dạng không hợp lệ. Cho phép: " + allowedTypes);
        }
    }

    private String saveFile(MultipartFile file, String subDir) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID() + extension;

            Path targetPath = Paths.get(uploadDir, subDir, filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("File uploaded: {}", targetPath);
            return "/uploads/" + subDir + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu file: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) return;
        try {
            Path filePath = Paths.get(uploadDir, fileUrl.replace("/uploads/", ""));
            Files.deleteIfExists(filePath);
            log.info("File deleted: {}", filePath);
        } catch (IOException e) {
            log.warn("Không thể xóa file: {}", fileUrl, e);
        }
    }
}
