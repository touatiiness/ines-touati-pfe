package com.projetpfe.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projetpfe.classe.LoginRequest;
import com.projetpfe.classe.LoginResponse;
import com.projetpfe.classe.Utilisateur;
import com.projetpfe.repository.UtilisateurRepository;
import com.projetpfe.security.JwtTokenUtils;

import lombok.NonNull;

@RestController
@CrossOrigin("*")
@RequestMapping("auth")
public class AuthController {


@Autowired
@Lazy
PasswordEncoder passwordencoder ;
@Autowired
@Lazy
AuthenticationManager authenticationManager;
@Autowired
JwtTokenUtils JwtTokenUtils ;
@Autowired
UtilisateurRepository userrepos ; 

@PostMapping("/login")
public ResponseEntity<LoginResponse> login (@RequestBody LoginRequest loginRequest ){
	// Login avec username (student_id)
	Authentication authentication = authenticationManager.authenticate(
		new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
	);
	SecurityContextHolder.getContext().setAuthentication(authentication);
	UserDetails userDetails =  (UserDetails) authentication.getPrincipal();
	String token = this.JwtTokenUtils.generateToken(userDetails);
	Utilisateur user = this.userrepos.findByUsername(loginRequest.getUsername());
	return ResponseEntity.ok(new LoginResponse(
		token,
		"Bearer",
		"Login Succefully",
		user.getProfil().getName(),
		user.getUsername(),  // Retourner username au lieu d'email
		user.getId()
	));

}
}
