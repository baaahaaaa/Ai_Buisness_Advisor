package com.aibusinessadvisor.backend.controller;

import com.aibusinessadvisor.backend.service.AiServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/advisor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiAdvisorController {

    private final AiServiceClient aiServiceClient;

    @GetMapping("/analyse/{clientId}")
    public Map getAnalyse(
            @PathVariable Integer clientId
    ) {
        return aiServiceClient.getAnalyse(clientId);
    }

    @PostMapping("/chat/{clientId}")
    public Map chat(
            @PathVariable Integer clientId,
            @RequestBody Map<String, String> body
    ) {
        return aiServiceClient.getChatResponse(
                clientId,
                body.get("question")
        );
    }

    @GetMapping("/historique/{clientId}")
    public Map getHistorique(
            @PathVariable Integer clientId
    ) {
        return aiServiceClient.getHistorique(clientId);
    }

    @GetMapping("/chat/{clientId}/historique")
    public Map getChatHistorique(
            @PathVariable Integer clientId
    ) {
        return aiServiceClient.getChatHistorique(clientId);
    }

    @GetMapping("/dashboard")
    public Map getDashboard() {
        return aiServiceClient.getDashboard();
    }

    @GetMapping("/report/client/{clientId}")
    public Map getReportClient(
            @PathVariable Integer clientId
    ) {
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

    @GetMapping("/report/client/{clientId}/pdf")
    public ResponseEntity<byte[]> getReportClientPdf(
            @PathVariable Integer clientId
    ) {

        byte[] pdf =
                aiServiceClient.getReportClientPdf(clientId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=rapport_client_"
                                + clientId
                                + ".pdf"
                )
                .body(pdf);
    }

    @GetMapping("/report/global/pdf")
    public ResponseEntity<byte[]> getReportGlobalPdf() {

        byte[] pdf =
                aiServiceClient.getReportGlobalPdf();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=rapport_global.pdf"
                )
                .body(pdf);
    }
}