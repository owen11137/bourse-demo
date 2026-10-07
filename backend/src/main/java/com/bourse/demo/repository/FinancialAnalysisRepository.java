package com.bourse.demo.repository;

import com.bourse.demo.entity.FinancialAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinancialAnalysisRepository extends JpaRepository<FinancialAnalysis, Long> {}
