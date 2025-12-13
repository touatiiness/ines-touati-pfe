package com.projetpfe.controller;

import java.security.NoSuchAlgorithmException;
import java.util.List;

import javax.crypto.NoSuchPaddingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projetpfe.classe.Profil;
import com.projetpfe.classe.Utilisateur;
import com.projetpfe.repository.ProfilRepository;
import com.projetpfe.repository.UtilisateurRepository;
import com.projetpfe.service.MailService;

@RestController
@RequestMapping("user")
@CrossOrigin("*")
public class UtilisateurController {
@Autowired
UtilisateurRepository userrepos ;
@Autowired
ProfilRepository profrepos ;
@Autowired
@Lazy
PasswordEncoder encoder ; 


@PostMapping("modifiermp")
public String modifiermp(Long id , String password) {
	Utilisateur u = this.userrepos.findById(id).get();
	String pass = encoder.encode(password);
	u.setPassword(pass);
	this.userrepos.save(u);
	return "true" ; 
	
}
@PostMapping("ajout")
public String ajout(@RequestBody Utilisateur u,String profil) {
	Utilisateur user = this.userrepos.findByEmail(u.getEmail());
	Profil  p = this.profrepos.findByName(profil);
	String pass = encoder.encode(u.getPassword()); 
	
	if(user==null) {
		u.setUsername(u.getEmail());
		u.setPassword(pass);
		u.setArchiver(false);
		u.setProfil(p);
		this.userrepos.save(u);
		return "true";
	}
	else {
		return "false" ;
	}
	
}
@Autowired
MailService mailservice ; 
@PostMapping("renitialisermp")
public String testmail(String email) throws NoSuchAlgorithmException, NoSuchPaddingException {
	this.mailservice.renitialisermp(email);
	return "true" ; 
	
}


@GetMapping("affichagearchiverisfalse")
public List<Utilisateur> list(){
	return this.userrepos.findByArchiverIsFalse();
}

@GetMapping("affichagearchiveristrue")
public List<Utilisateur> listtrue(){
	return this.userrepos.findByArchiverIsTrue();
}
@PutMapping("archiver")
public String archiver(Long id) {
Utilisateur u = this.userrepos.findById(id).get();
u.setArchiver(true);
this.userrepos.save(u);
return "true";
}



@PutMapping("desarchiver")
public String desarchiver(Long id) {
Utilisateur u = this.userrepos.findById(id).get();
u.setArchiver(false);
this.userrepos.save(u);
return "true";
}

@GetMapping("afficherbyprofil")
public List<Utilisateur> afficherbyprpfil(String profil){
	Profil  p = this.profrepos.findByName(profil);
	return this.userrepos.findByProfil(p);
}
@GetMapping("afficherbyid")

public Utilisateur afficherbyid(Long id) {
	return this.userrepos.findById(id).get();
}

@PostMapping("niveau")

public String niveau(Long id , String niveau) {
	Utilisateur u = this.userrepos.findById(id).get();

	u.setNiveau(niveau);
	this.userrepos.save(u);
	return "true" ;
}

}
