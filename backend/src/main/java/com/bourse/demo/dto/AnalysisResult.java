package com.bourse.demo.dto;

import java.util.List;

public record AnalysisResult(
        Company company,
        Indicators indicators,
        Estimates estimates,
        Revenue revenue,
        Analysis analysis) {

    public record Company(String name, String fiscalYearEnd, Double marketValueBillionToman) {}
    public record Indicators(Double fisProfitMarginPercent, Double receivablesRatioPercent,
                             Double averageDividendPayoutPercent, Double exportSalesRatioPercent) {}
    public record Estimates(Double operatingProfit, Double otherOperatingIncome, Double dividendIncome,
                            Double bankDepositInterest, Double otherNonOperatingIncome, Double netProfit) {}
    public record Revenue(Double currentMonth, Double sixMonthAverage, Double sixMonthTotal,
                          Double yearOverYearGrowthPercent) {}
    public record Analysis(String summary, List<String> positivePoints, List<String> riskPoints) {}
}
