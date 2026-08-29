package com.aibusinessadvisor.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpStatusCodeException;

import java.util.Map;

/**
 * Intercepte les erreurs renvoyées par le service IA (FastAPI) via
 * AiServiceClient (RestTemplate) et les relaie telles quelles au frontend,
 * au lieu de laisser Spring transformer tout code non-2xx en 500 générique.
 *
 * Exemple concret : FastAPI renvoie 404 {"detail":"client introuvable"}
 * pour un client sans données suffisantes -> sans ce handler, RestTemplate
 * lève HttpClientErrorException.NotFound, non interceptée, et Spring Boot
 * la transforme en 500 Internal Server Error avant même d'atteindre le
 * frontend. Avec ce handler, le frontend reçoit le vrai 404 et le vrai
 * message, et peut l'afficher proprement à l'utilisateur.
 */
@RestControllerAdvice
public class AiServiceExceptionHandler {

    @ExceptionHandler(HttpStatusCodeException.class)
    public ResponseEntity<byte[]> handleAiServiceError(HttpStatusCodeException ex) {

        HttpHeaders originalHeaders = ex.getResponseHeaders();
        MediaType contentType =
                (originalHeaders != null && originalHeaders.getContentType() != null)
                        ? originalHeaders.getContentType()
                        : MediaType.APPLICATION_JSON;

        return ResponseEntity
                .status(ex.getStatusCode())
                .contentType(contentType)
                .body(ex.getResponseBodyAsByteArray());
    }

    /**
     * Cas où le header Authorization est absent de la requête reçue par
     * Spring Boot (voir AiServiceClient.getAuthorizationHeader) : sans ce
     * handler, l'IllegalStateException levée remonte non interceptée et
     * devient elle aussi un 500 générique au lieu d'un 401 explicite.
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleMissingAuth(IllegalStateException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .contentType(MediaType.TEXT_PLAIN)
                .body(ex.getMessage());
    }

    /**
     * Violation de contrainte d'intégrité en base (ex: email déjà utilisé
     * par un autre client, via Client.email @Column(unique = true)).
     *
     * Sans ce handler, cette exception non interceptée devient un 500
     * générique (voir logs : "Duplicate entry '...' for key
     * 'client.UK...'"), sans jamais informer l'utilisateur de la vraie
     * cause (email dupliqué) qu'il peut corriger lui-même dans le
     * formulaire. On ne relaie jamais le message SQL brut (nom de
     * contrainte, requête) au client, seulement un message générique et
     * sûr, dans le même format {"detail": "..."} que les erreurs FastAPI
     * pour que le frontend gère les deux de façon uniforme.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("detail", "Cette opération est impossible : une contrainte d'unicité est violée (par exemple, cet email est déjà utilisé par un autre client)."));
    }
}