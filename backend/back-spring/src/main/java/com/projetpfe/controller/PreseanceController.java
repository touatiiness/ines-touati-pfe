package com.projetpfe.controller;

import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projetpfe.classe.Presence;
import com.projetpfe.classe.Seance;
import com.projetpfe.classe.Utilisateur;
import com.projetpfe.repository.PresenceRepository;
import com.projetpfe.repository.SeanceRepository;
import com.projetpfe.repository.UtilisateurRepository;

@RestController
@RequestMapping("presence")
public class PreseanceController {

@Autowired
private PresenceRepository prepos ;
@Autowired
private UtilisateurRepository userrepos ; 
@Autowired
private SeanceRepository seancerepos ; 

@PostMapping("Ajout")
public String Ajout(@RequestBody Presence p , String email , Long idseance) {
	Utilisateur u = this.userrepos.findByEmail(email);
	Seance s = this.seancerepos.findById(idseance).get();
	p.setEtudiant(u);
	p.setSeance(s);
	p.setNiveau(s.getNiveau());
	this.prepos.save(p);
	return "true" ; 
	
	
}

	@GetMapping("preseancebyseance")
	public List<Presence> preseancebyseance(Long idseance){
		Seance s = this.seancerepos.findById(idseance).get();
		return this.prepos.findBySeance(s);

	}
	@GetMapping("presencebyetudiant")
	public int presencebyetudiant(String email , String niveau){
		Utilisateur u = this.userrepos.findByEmail(email);
		List<Presence> list= this.prepos.findByEtudiantAndNiveau(u,niveau);
		System.out.println(list.size());

	return list.size() ; 
	}
	
}
