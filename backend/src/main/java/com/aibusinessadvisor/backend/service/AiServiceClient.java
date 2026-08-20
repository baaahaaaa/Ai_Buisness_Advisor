package com.aibusinessadvisor.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AiServiceClient {

    private final RestTemplate restTemplate;
    private final HttpServletRequest request;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public AiServiceClient(
            RestTemplate restTemplate,
            HttpServletRequest request
    ) {
        this.restTemplate = restTemplate;
        this.request = request;
    }

    /**
     * Récupère le JWT directement depuis la requête
     * envoyée à Spring Boot.
     */
    private String getAuthorizationHeader() {

        String authorization =
                request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorization == null || authorization.isBlank()) {
            throw new IllegalStateException(
                    "Header Authorization absent de la requête Spring Boot"
            );
        }

        return authorization;
    }

    /**
     * Prépare les headers pour FastAPI.
     */
    private HttpHeaders createHeaders() {

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);

        headers.set(
                HttpHeaders.AUTHORIZATION,
                getAuthorizationHeader()
        );

        return headers;
    }

    private HttpEntity<Void> getEntity() {
        return new HttpEntity<>(createHeaders());
    }

    /**
     * Analyse complète d'un client.
     */
    public Map getAnalyse(Integer clientId) {

        String url =
                aiServiceUrl
                        + "/analyse/"
                        + clientId;

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        getEntity(),
                        Map.class
                );

        return response.getBody();
    }

    /**
     * Chat IA.
     */
    public Map getChatResponse(
            Integer clientId,
            String question
    ) {

        String url =
                aiServiceUrl
                        + "/chat/"
                        + clientId;

        Map<String, String> body =
                Map.of(
                        "question",
                        question
                );

        HttpEntity<Map<String, String>> entity =
                new HttpEntity<>(
                        body,
                        createHeaders()
                );

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        Map.class
                );

        return response.getBody();
    }

    /**
     * Historique des analyses.
     */
    public Map getHistorique(Integer clientId) {

        String url =
                aiServiceUrl
                        + "/historique/"
                        + clientId;

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        getEntity(),
                        Map.class
                );

        return response.getBody();
    }

    /**
     * Historique du chat.
     */
    public Map getChatHistorique(Integer clientId) {

        String url =
                aiServiceUrl
                        + "/chat/"
                        + clientId
                        + "/historique";

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        getEntity(),
                        Map.class
                );

        return response.getBody();
    }

    /**
     * Dashboard.
     */
    public Map getDashboard() {

        String url =
                aiServiceUrl
                        + "/dashboard";

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        getEntity(),
                        Map.class
                );

        return response.getBody();
    }

    /**
     * Rapport client JSON.
     */
    public Map getReportClient(Integer clientId) {

        String url =
                aiServiceUrl
                        + "/report/client/"
                        + clientId;

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        getEntity(),
                        Map.class
                );

        return response.getBody();
    }

    /**
     * Rapport global JSON.
     */
    public Map getReportGlobal() {

        String url =
                aiServiceUrl
                        + "/report/global";

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        getEntity(),
                        Map.class
                );

        return response.getBody();
    }

    /**
     * Health du service IA.
     */
    public Map getHealth() {

        String url =
                aiServiceUrl
                        .replace("/api", "")
                        + "/";

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        getEntity(),
                        Map.class
                );

        return response.getBody();
    }

    /**
     * Rapport client PDF.
     */
    public byte[] getReportClientPdf(Integer clientId) {

        String url =
                aiServiceUrl
                        + "/report/client/"
                        + clientId
                        + "/pdf";

        ResponseEntity<byte[]> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        getEntity(),
                        byte[].class
                );

        return response.getBody();
    }

    /**
     * Rapport global PDF.
     */
    public byte[] getReportGlobalPdf() {

        String url =
                aiServiceUrl
                        + "/report/global/pdf";

        ResponseEntity<byte[]> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        getEntity(),
                        byte[].class
                );

        return response.getBody();
    }
}