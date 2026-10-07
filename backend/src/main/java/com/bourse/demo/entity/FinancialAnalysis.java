package com.bourse.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_analysis")
@Getter @Setter @NoArgsConstructor
public class FinancialAnalysis {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String companyName;
    private String fiscalYearEnd;
    private Double marketValueBillionToman;
    private Double netProfit;
    private Double operatingProfit;
    private Double profitMarginPercent;
    private String originalFileName;
    private LocalDateTime createdAt;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String resultJson;

    @PrePersist
    void prePersist() { createdAt = LocalDateTime.now(); }
}
