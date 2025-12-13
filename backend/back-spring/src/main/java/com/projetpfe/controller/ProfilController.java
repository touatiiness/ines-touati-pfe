package com.projetpfe.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projetpfe.classe.Profil;
import com.projetpfe.repository.ProfilRepository;

@RestController
@RequestMapping("profil")
public class ProfilController {
	
@Autowired
ProfilRepository profilrepos ; 



@PostMapping("ajouter")
public String Ajout(@RequestBody Profil p) {
	
	Profil profil = this.profilrepos.findByName(p.getName());	
	if(profil!=null) {
		return "profil existe";
	}
	else {
	p.setArchiver(false);	
	this.profilrepos.save(p);

	return "ajouter avec succées";	
}
}

//autoriser juste pour profil Enseignant
//@PreAuthorize("hasAuthority('Enseignant')")
// autoriser pour les profils enseignant et admin
//@PreAuthorize("hasAnyAuthority('Enseignant','Admin')")
@GetMapping("affichagelistnonarchiver")
public List<Profil> list(){
	return this.profilrepos.findByArchiverIsFalse();
}

@GetMapping("affichagelistarchiver")
public List<Profil> listzrchiver(){
	return this.profilrepos.findByArchiverIsTrue();
}

@GetMapping("affichagebyid")
public Profil afficherbyid(Long id) {
	return this.profilrepos.findById(id).get();
	
}
@PutMapping("archiver")
public String archiver(Long id) {
Profil p = this.profilrepos.findById(id).get();
p.setArchiver(true);
this.profilrepos.save(p);
return "true";
}
@PutMapping("desarchiver")
public String desarchiver(Long id) {
Profil p = this.profilrepos.findById(id).get();
p.setArchiver(false);
this.profilrepos.save(p);
return "true";
}
	
@GetMapping("affcommencebyE")
public List<Profil>affcommencebyE(){
	return this.profilrepos.listname();
}

@DeleteMapping("supprimer")
public String supprimer (Long id) {
	Profil p = this.profilrepos.findById(id).get();
	this.profilrepos.delete(p);
	return "true" ; 
	
	
	
}



	
	



}
