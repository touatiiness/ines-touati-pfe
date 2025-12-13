package com.projetpfe.classe;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Questions {
	  private String question;
	    private List<String> options;
	    private String correctAnswer;

}
