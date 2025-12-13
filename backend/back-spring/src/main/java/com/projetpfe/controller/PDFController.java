package com.projetpfe.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.projetpfe.service.PDFService;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
@RestController
@RequestMapping("/api/quiz")
@CrossOrigin("*")
public class PDFController {
	@PostMapping("/generateQuestions")
	public ResponseEntity<List<Map<String, Object>>> generateQuestions(@RequestPart("file") MultipartFile file) throws IOException {
	    // Extraction du texte du PDF
	    String courseContent = extractTextFromPDF(file);

	    // Séparer le contenu par lignes
	    String[] lines = courseContent.split("\n");

	    List<Map<String, Object>> questions = new ArrayList<>();

	    for (String line : lines) {
	        if (line.trim().toLowerCase().startsWith("module")) { // Vérifier si la ligne contient "Module"
	            Map<String, Object> question = new HashMap<>();
	            String keyword = extractKeyword(line); // Extraire le mot-clé pertinent

	            if (!keyword.equals("Unknown")) { // Ne pas générer de question si aucun mot-clé n'est trouvé
	                question.put("question", "What is the main topic of the following module: " + line);
	                question.put("correct_answer", keyword);
	                question.put("incorrect_answers", generateIncorrectAnswers(keyword));

	                questions.add(question);
	            }
	        }
	    }

	    return ResponseEntity.ok(questions);
	}

	// Fonction pour extraire du texte depuis un PDF
	private String extractTextFromPDF(MultipartFile file) throws IOException {
	    PDDocument document = PDDocument.load(file.getInputStream());
	    PDFTextStripper pdfStripper = new PDFTextStripper();
	    String text = pdfStripper.getText(document);
	    document.close();
	    return text;
	}

	// Fonction améliorée pour extraire le mot-clé d'un module
	private String extractKeyword(String phrase) {
	    String[] words = phrase.replaceAll("[:,]", "").split(" ");
	    
	    if (words.length > 2) {
	        return words[2]; // Prend le mot-clé après "Module X:"
	    }
	    
	    return "Unknown"; // Retourne "Unknown" si aucun mot-clé n'est trouvé
	}

	// Génération de mauvaises réponses plus réalistes
	private List<String> generateIncorrectAnswers(String correctAnswer) {
	    List<String> incorrectAnswers = new ArrayList<>();
	    
	    incorrectAnswers.add(correctAnswer + " Concepts"); // Variante du mot-clé
	    incorrectAnswers.add("Fundamentals of " + correctAnswer); // Une phrase générique
	    incorrectAnswers.add("Introduction to " + correctAnswer); // Autre variante
	    
	    return incorrectAnswers;
	}

}