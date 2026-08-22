package com.aibusinessadvisor.backend.exception;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpStatusCodeException;

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
}