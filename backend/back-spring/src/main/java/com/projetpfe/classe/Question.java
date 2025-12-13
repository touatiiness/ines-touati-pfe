package com.projetpfe.classe;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Question {
	  @Id
	    @GeneratedValue(strategy = GenerationType.AUTO)
	    private Long id;
	    private String questionText;
	    private String optionA;
	    private String optionB;
	    private String optionC;
	    private String correctAnswer;  
}
