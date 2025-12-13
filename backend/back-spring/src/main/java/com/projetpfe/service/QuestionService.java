package com.projetpfe.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.projetpfe.classe.Question;
import com.projetpfe.repository.QuestionRepository;

@Service
public class QuestionService {
    @Autowired
    private QuestionRepository questionRepository;

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    public void addQuestion(Question question) {
        questionRepository.save(question);
    }

    public int calculateScore(Map<Long, String> userAnswers) {
        int score = 0;
        for (Map.Entry<Long, String> entry : userAnswers.entrySet()) {
            Question question = questionRepository.findById(entry.getKey()).orElse(null);
            if (question != null && question.getCorrectAnswer().equals(entry.getValue())) {
                score++;
            }
        }
        return score;
    }
}
