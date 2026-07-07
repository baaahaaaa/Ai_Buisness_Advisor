package com.aibusinessadvisor.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AiServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public AiServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map getAnalyse(Integer clientId) {
        String url = aiServiceUrl + "/analyse/" + clientId;
        return restTemplate.getForObject(url, Map.class);
    }

    public Map getChatResponse(Integer clientId, String question) {
        String url = aiServiceUrl + "/chat/" + clientId;
        Map<String, String> body = Map.of("question", question);
        return restTemplate.postForObject(url, body, Map.class);
    }

    public Map getHistorique(Integer clientId) {
        String url = aiServiceUrl + "/historique/" + clientId;
        return restTemplate.getForObject(url, Map.class);
    }

    public Map getChatHistorique(Integer clientId) {
        String url = aiServiceUrl + "/chat/" + clientId + "/historique";
        return restTemplate.getForObject(url, Map.class);
    }

    public Map getDashboard() {
        String url = aiServiceUrl + "/dashboard";
        return restTemplate.getForObject(url, Map.class);
    }

    public Map getReportClient(Integer clientId) {
        String url = aiServiceUrl + "/report/client/" + clientId;
        return restTemplate.getForObject(url, Map.class);
    }

    public Map getReportGlobal() {
        String url = aiServiceUrl + "/report/global";
        return restTemplate.getForObject(url, Map.class);
    }

    public Map getHealth() {
        String url = aiServiceUrl.replace("/api", "") + "/";
        return restTemplate.getForObject(url, Map.class);
    }
}