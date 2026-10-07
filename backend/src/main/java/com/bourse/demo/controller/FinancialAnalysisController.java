package com.bourse.demo.controller;

import com.bourse.demo.dto.AnalysisResponse;
import com.bourse.demo.service.FinancialAnalysisService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analyses")
public class FinancialAnalysisController {
    private final FinancialAnalysisService service;
    public FinancialAnalysisController(FinancialAnalysisService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AnalysisResponse analyze(@RequestPart("image") MultipartFile image) throws IOException { return service.analyze(image); }

    @GetMapping
    public List<AnalysisResponse> all() { return service.findAll(); }

    @GetMapping("/{id}")
    public AnalysisResponse one(@PathVariable Long id) { return service.findById(id); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
