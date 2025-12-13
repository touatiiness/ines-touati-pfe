package com.projetpfe.classe;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Utilisateur {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id ; 
	private String nom ;
	private String prenom ;
	private String email ;
	private Long numtel ; 
	private String classe ;
	private boolean archiver ; 
	private String niveau ;
	private String password ; 
	private String username ; 
	@ManyToOne
	Profil profil ;
	
	
}
