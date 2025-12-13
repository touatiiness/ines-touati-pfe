package com.projetpfe.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projetpfe.classe.Question;

public interface QuestionRepository extends JpaRepository<Question,Long> {

}
