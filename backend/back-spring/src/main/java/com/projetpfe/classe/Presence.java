package com.projetpfe.classe;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Presence {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id ; 
	@Temporal(TemporalType.DATE)
	private Date date;
	private String niveau ; 
	@ManyToOne
	Seance seance ;
	@ManyToOne
	Utilisateur etudiant ; 
}
