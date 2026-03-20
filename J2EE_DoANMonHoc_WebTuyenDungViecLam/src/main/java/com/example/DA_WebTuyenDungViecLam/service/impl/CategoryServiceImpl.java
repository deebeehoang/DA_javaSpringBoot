package com.example.DA_WebTuyenDungViecLam.service.impl;

import com.example.DA_WebTuyenDungViecLam.dto.response.CategoryResponse;
import com.example.DA_WebTuyenDungViecLam.repository.CategoryRepository;
import com.example.DA_WebTuyenDungViecLam.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getAllActive() {
        return categoryRepository.findByActiveTrue().stream()
                .map(c -> CategoryResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .slug(c.getSlug())
                        .icon(c.getIcon())
                        .description(c.getDescription())
                        .build())
                .toList();
    }
}
