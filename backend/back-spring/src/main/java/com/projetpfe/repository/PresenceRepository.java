package com.projetpfe.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projetpfe.classe.Presence;
import com.projetpfe.classe.Seance;
import com.projetpfe.classe.Utilisateur;

public interface PresenceRepository extends JpaRepository<Presence, Long> {

	List<Presence> findBySeance(Seance s);

	List<Presence> findByEtudiantAndNiveau(Utilisateur u, String niveau);

}
