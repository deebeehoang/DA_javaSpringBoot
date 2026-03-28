package com.example.DA_WebTuyenDungViecLam.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được trống")
    private String name;

    @NotBlank(message = "Slug không được trống")
    private String slug;

    private String icon;
    private String description;
}
