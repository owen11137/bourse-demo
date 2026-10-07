package com.bourse.demo.service;

import com.bourse.demo.dto.*;
import com.bourse.demo.entity.FinancialAnalysis;
import com.bourse.demo.repository.FinancialAnalysisRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class FinancialAnalysisService {
    private final OpenAiVisionService ai;
    private final FinancialAnalysisRepository repository;
    private final ObjectMapper mapper;

    public FinancialAnalysisService(OpenAiVisionService ai, FinancialAnalysisRepository repository, ObjectMapper mapper) {
        this.ai = ai; this.repository = repository; this.mapper = mapper;
    }

    @Transactional
    public AnalysisResponse analyze(MultipartFile image) throws IOException {
        AnalysisResult result = ai.analyze(image);
        FinancialAnalysis e = new FinancialAnalysis();
        e.setOriginalFileName(image.getOriginalFilename());
        if (result.company() != null) {
            e.setCompanyName(result.company().name());
            e.setFiscalYearEnd(result.company().fiscalYearEnd());
            e.setMarketValueBillionToman(result.company().marketValueBillionToman());
        }
        if (result.estimates() != null) {
            e.setNetProfit(result.estimates().netProfit());
            e.setOperatingProfit(result.estimates().operatingProfit());
        }
        if (result.indicators() != null) e.setProfitMarginPercent(result.indicators().fisProfitMarginPercent());
        e.setResultJson(mapper.writeValueAsString(result));
        repository.save(e);
        return new AnalysisResponse(e.getId(), e.getCreatedAt(), result);
    }

    @Transactional(readOnly = true)
    public List<AnalysisResponse> findAll() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AnalysisResponse findById(Long id) {
        return toResponse(repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Analysis not found")));
    }

    @Transactional
    public void delete(Long id) { repository.deleteById(id); }

    private AnalysisResponse toResponse(FinancialAnalysis e) {
        try { return new AnalysisResponse(e.getId(), e.getCreatedAt(), mapper.readValue(e.getResultJson(), AnalysisResult.class)); }
        catch (Exception ex) { throw new IllegalStateException(ex); }
    }
}
