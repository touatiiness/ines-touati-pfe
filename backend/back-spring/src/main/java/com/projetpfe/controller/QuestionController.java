package com.projetpfe.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projetpfe.classe.Question;
import com.projetpfe.service.QuestionService;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin("*")
public class QuestionController {
    @Autowired
    private QuestionService questionService;

    @GetMapping
    public List<Question> getAllQuestions() {
        return questionService.getAllQuestions();
    }

    @PostMapping
    public void addQuestion(@RequestBody Question question) {
        questionService.addQuestion(question);
    }

    @PostMapping("/submit")
    public int submitQuiz(@RequestBody Map<Long, String> userAnswers) {
    	System.out.println(userAnswers);
        return questionService.calculateScore(userAnswers);
    }
}
