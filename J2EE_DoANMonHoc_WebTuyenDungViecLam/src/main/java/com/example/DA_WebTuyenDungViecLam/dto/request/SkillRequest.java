package com.example.DA_WebTuyenDungViecLam.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SkillRequest {

    @NotBlank(message = "Tên kỹ năng không được để trống")
    private String name;

    private String category; // TECHNICAL, SOFT_SKILL, LANGUAGE, OTHER
}
