package com.bourse.demo.dto;

import java.time.LocalDateTime;

public record AnalysisResponse(Long id, LocalDateTime createdAt, AnalysisResult result) {}
