package com.projetpfe.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projetpfe.classe.Profil;
import com.projetpfe.classe.Utilisateur;

public interface UtilisateurRepository extends JpaRepository<Utilisateur,Long> {

	Utilisateur findByEmail(String email);

	Utilisateur findByUsername(String username);

	List<Utilisateur> findByProfil(Profil p);

	List<Utilisateur> findByArchiverIsFalse();

	List<Utilisateur> findByArchiverIsTrue();


}
