package com.bourse.demo.service;

import com.bourse.demo.dto.AnalysisResult;
import com.fasterxml.jackson.databind.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class OpenAiVisionService {
    private final RestClient client;
    private final ObjectMapper mapper;
    private final String apiKey;
    private final String model;

    public OpenAiVisionService(ObjectMapper mapper,
                               @Value("${openai.api-key}") String apiKey,
                               @Value("${openai.model}") String model) {
        this.mapper = mapper;
        this.apiKey = apiKey;
        this.model = model;
        this.client = RestClient.builder().baseUrl("https://api.openai.com/v1").build();
    }

    public AnalysisResult analyze(MultipartFile image) throws IOException {
        if (apiKey == null || apiKey.isBlank()) throw new IllegalStateException("OPENAI_API_KEY is not configured");
        String type = Optional.ofNullable(image.getContentType()).orElse("image/jpeg");
        String dataUrl = "data:" + type + ";base64," + Base64.getEncoder().encodeToString(image.getBytes());

        String prompt = """
                تصویر یک داشبورد یا گزارش مالی فارسی/انگلیسی است.
                اعداد و اطلاعات را با دقت از خود تصویر استخراج کن. چیزی را حدس نزن.
                اگر مقداری در تصویر قابل تشخیص نیست null قرار بده.
                واحدها را مطابق فیلدهای خروجی رعایت کن.
                summary و positivePoints و riskPoints را به فارسی بنویس.
                """;

        Map<String,Object> body = Map.of(
                "model", model,
                "input", List.of(Map.of("role","user","content", List.of(
                        Map.of("type","input_text","text",prompt),
                        Map.of("type","input_image","image_url",dataUrl)
                ))),
                "text", Map.of("format", Map.of(
                        "type","json_schema",
                        "name","financial_analysis",
                        "strict",true,
                        "schema", schema()
                ))
        );

        JsonNode response = client.post().uri("/responses")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve().body(JsonNode.class);

        String json = extractOutputText(response);
        return mapper.readValue(json, AnalysisResult.class);
    }

    private String extractOutputText(JsonNode root) {
        for (JsonNode output : root.path("output")) {
            for (JsonNode content : output.path("content")) {
                if ("output_text".equals(content.path("type").asText()) && content.has("text"))
                    return content.path("text").asText();
            }
        }
        throw new IllegalStateException("OpenAI response did not contain output_text");
    }

    private Map<String,Object> schema() {
        Map<String,Object> nullableNumber = Map.of("type", List.of("number","null"));
        Map<String,Object> nullableString = Map.of("type", List.of("string","null"));
        Map<String,Object> company = object(Map.of(
                "name", nullableString, "fiscalYearEnd", nullableString, "marketValueBillionToman", nullableNumber));
        Map<String,Object> indicators = object(Map.of(
                "fisProfitMarginPercent", nullableNumber, "receivablesRatioPercent", nullableNumber,
                "averageDividendPayoutPercent", nullableNumber, "exportSalesRatioPercent", nullableNumber));
        Map<String,Object> estimates = object(Map.of(
                "operatingProfit", nullableNumber, "otherOperatingIncome", nullableNumber,
                "dividendIncome", nullableNumber, "bankDepositInterest", nullableNumber,
                "otherNonOperatingIncome", nullableNumber, "netProfit", nullableNumber));
        Map<String,Object> revenue = object(Map.of(
                "currentMonth", nullableNumber, "sixMonthAverage", nullableNumber,
                "sixMonthTotal", nullableNumber, "yearOverYearGrowthPercent", nullableNumber));
        Map<String,Object> analysis = object(Map.of(
                "summary", Map.of("type","string"),
                "positivePoints", Map.of("type","array","items",Map.of("type","string")),
                "riskPoints", Map.of("type","array","items",Map.of("type","string"))));
        return object(Map.of("company",company,"indicators",indicators,"estimates",estimates,"revenue",revenue,"analysis",analysis));
    }

    private Map<String,Object> object(Map<String,Object> properties) {
        return Map.of("type","object","additionalProperties",false,
                "properties",properties,"required",new ArrayList<>(properties.keySet()));
    }
}
