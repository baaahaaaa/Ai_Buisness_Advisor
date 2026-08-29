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
public class AdvisorController {


    private final AiServiceClient aiServiceClient;


    // =====================================================
    // ANALYSE CLIENT
    // =====================================================

    @GetMapping("/analyse/{clientId}")
    public ResponseEntity<Map> analyse(
            @PathVariable Integer clientId
    ) {

        Map result =
                aiServiceClient.getAnalyse(clientId);

        return ResponseEntity.ok(result);
    }


    // =====================================================
    // CHAT IA
    // =====================================================

    @PostMapping("/chat/{clientId}")
    public ResponseEntity<Map> chat(
            @PathVariable Integer clientId,
            @RequestBody Map<String, String> request
    ) {

        String question =
                request.get("question");


        if (
                question == null ||
                question.isBlank()
        ) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }


        Map result =
                aiServiceClient.getChatResponse(
                        clientId,
                        question
                );


        return ResponseEntity.ok(result);
    }


    // =====================================================
    // HISTORIQUE ANALYSES
    // =====================================================

    @GetMapping("/historique/{clientId}")
    public ResponseEntity<Map> historique(
            @PathVariable Integer clientId
    ) {

        return ResponseEntity.ok(
                aiServiceClient.getHistorique(clientId)
        );
    }


    // =====================================================
    // HISTORIQUE CHAT
    // =====================================================

    @GetMapping("/chat/{clientId}/historique")
    public ResponseEntity<Map> chatHistorique(
            @PathVariable Integer clientId
    ) {

        return ResponseEntity.ok(
                aiServiceClient.getChatHistorique(clientId)
        );
    }


    // =====================================================
    // DASHBOARD
    // =====================================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map> dashboard() {

        Map result =
                aiServiceClient.getDashboard();

        return ResponseEntity.ok(result);
    }


    // =====================================================
    // HEALTH IA
    // =====================================================

    @GetMapping("/health")
    public ResponseEntity<Map> health() {

        return ResponseEntity.ok(
                aiServiceClient.getHealth()
        );
    }


    // =====================================================
    // RAPPORT CLIENT JSON
    // =====================================================

    @GetMapping("/report/client/{clientId}")
    public ResponseEntity<Map> reportClient(
            @PathVariable Integer clientId
    ) {

        return ResponseEntity.ok(
                aiServiceClient.getReportClient(clientId)
        );
    }


    // =====================================================
    // RAPPORT GLOBAL JSON
    // =====================================================

    @GetMapping("/report/global")
    public ResponseEntity<Map> reportGlobal() {

        return ResponseEntity.ok(
                aiServiceClient.getReportGlobal()
        );
    }


    // =====================================================
    // RAPPORT CLIENT PDF
    // =====================================================

    @GetMapping("/report/client/{clientId}/pdf")
    public ResponseEntity<byte[]> reportClientPdf(
            @PathVariable Integer clientId
    ) {

        byte[] pdf =
                aiServiceClient.getReportClientPdf(
                        clientId
                );


        return ResponseEntity.ok()
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=rapport-client-"
                                + clientId
                                + ".pdf"
                )
                .body(pdf);
    }


    // =====================================================
    // RAPPORT GLOBAL PDF
    // =====================================================

    @GetMapping("/report/global/pdf")
    public ResponseEntity<byte[]> reportGlobalPdf() {

        byte[] pdf =
                aiServiceClient.getReportGlobalPdf();


        return ResponseEntity.ok()
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=rapport-global.pdf"
                )
                .body(pdf);
    }

}