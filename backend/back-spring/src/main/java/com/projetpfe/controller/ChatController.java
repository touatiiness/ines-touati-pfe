package com.projetpfe.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin("*")
public class ChatController {

    @GetMapping("/getQuestions")
    public ResponseEntity<Map<String, Object>> getQuestions(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String category
    ) {
        String url = "https://opentdb.com/api.php?amount=10&type=multiple&difficulty=" + (level != null ? level : "easy") + "&lang=en";

        if (category != null && !category.isEmpty()) {
            String categoryId = getCategoryIdFromName(category);
            if (categoryId != null) {
                url += "&category=" + categoryId;
            } else {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Catégorie invalide"));
            }
        }

        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        // Vérification de la réponse de l'API externe
        if (response == null || !response.containsKey("results")) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Erreur de récupération des questions"));
        }

        // Mélanger les réponses
        List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");

     // Vérifier et ajuster les réponses spécifiques pour les questions de traduction
        for (Map<String, Object> question : results) {
            List<String> incorrectAnswers = (List<String>) question.get("incorrect_answers");
            String correctAnswer = (String) question.get("correct_answer");

            // Gérer les questions spécifiques comme les traductions
            if (question.get("question").toString().contains("French word for")) {
                // Exemple: "What is the French word for 'hat'?"
                if ("hat".equalsIgnoreCase(correctAnswer)) {
                    correctAnswer = "chapeau"; // Traduction correcte
                }
            }

            // Mélanger les réponses
            List<String> allAnswers = incorrectAnswers.stream().collect(Collectors.toList());
            allAnswers.add(correctAnswer);
            Collections.shuffle(allAnswers);

            // Enregistrer l'index de la bonne réponse
            int correctAnswerIndex = allAnswers.indexOf(correctAnswer);
            question.put("answers", allAnswers);
            question.put("correct_answer_index", correctAnswerIndex); // Ajouter l'index de la bonne réponse
            question.remove("incorrect_answers");
            question.remove("correct_answer");
        }

        return ResponseEntity.ok(response);
    }

    private String getCategoryIdFromName(String category) {
        switch (category.toLowerCase()) {
            case "vocabulary": return "9";
            case "science": return "17";
            case "film": return "11";
            case "history": return "23";
            case "music": return "12";
            case "sports": return "21";
            case "geography": return "22";
            case "politics": return "24";
            case "art": return "25";
            case "computers": return "18";
            default: return null;
        }
    }
}
