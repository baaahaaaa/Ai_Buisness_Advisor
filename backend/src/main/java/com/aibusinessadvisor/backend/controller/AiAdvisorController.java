package com.aibusinessadvisor.backend.controller;

import com.aibusinessadvisor.backend.service.AiServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/advisor")
@CrossOrigin(origins = "*")
public class AiAdvisorController {

    @Autowired
    private AiServiceClient aiServiceClient;

    @GetMapping("/analyse/{clientId}")
    public Map getAnalyse(@PathVariable Integer clientId) {
        return aiServiceClient.getAnalyse(clientId);
    }

    @PostMapping("/chat/{clientId}")
    public Map chat(@PathVariable Integer clientId, @RequestBody Map<String, String> body) {
        return aiServiceClient.getChatResponse(clientId, body.get("question"));
    }

    @GetMapping("/historique/{clientId}")
    public Map getHistorique(@PathVariable Integer clientId) {
        return aiServiceClient.getHistorique(clientId);
    }

    @GetMapping("/chat/{clientId}/historique")
    public Map getChatHistorique(@PathVariable Integer clientId) {
        return aiServiceClient.getChatHistorique(clientId);
    }

    @GetMapping("/dashboard")
    public Map getDashboard() {
        return aiServiceClient.getDashboard();
    }

    @GetMapping("/report/client/{clientId}")
    public Map getReportClient(@PathVariable Integer clientId) {
        return aiServiceClient.getReportClient(clientId);
    }

    @GetMapping("/report/global")
    public Map getReportGlobal() {
        return aiServiceClient.getReportGlobal();
    }

    @GetMapping("/health")
    public Map getHealth() {
        return aiServiceClient.getHealth();
    }
}