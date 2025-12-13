package com.projetpfe.classe;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.hibernate.annotations.Columns;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Seance {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id ; 
	private String lien ;
	private String titre ;
	private String niveau ;
	private String module ; 
	@Temporal(TemporalType.DATE)
	private Date date;
	private String description ;
	@Lob
	@Column(name="picbyte", length=10000)
	private byte[] image ;
	
	@ManyToOne
	private Utilisateur enseignant ; 
	
}
