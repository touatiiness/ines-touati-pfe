package com.projetpfe.classe;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity

public class Fichier {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id ; 
	private String name ; 
	@Lob
	@Column(name="picbyte", length=10000)
	private byte[] fichier ;
	@Lob
	@Column(name="image", length=10000)
	private byte[] image ;
	
	@ManyToOne
	Seance seance ; 

}
