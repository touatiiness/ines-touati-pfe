package com.projetpfe.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@Service
public class ImageGenerationService {

    @Autowired
    private WebClient.Builder webClientBuilder;

    private static final String API_URL = "https://api.openai.com/v1/images/generations";
    private static final String API_KEY = System.getenv("OPENAI_API_KEY"); // Clé API depuis variable d'environnement

    public String generateImage(String prompt) {
        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("prompt", prompt);
        requestPayload.put("n", 1); // Nombre d'images à générer
        requestPayload.put("size", "1024x1024"); // Taille de l'image

        // Faire la requête à l'API
        return webClientBuilder.baseUrl(API_URL)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + API_KEY)
                .build()
                .method(HttpMethod.POST)
                .bodyValue(requestPayload)
                .retrieve()
                .bodyToMono(String.class)
                .block();  // .block() pour attendre la réponse (à éviter en production, utiliser des méthodes réactives)
    }
}
