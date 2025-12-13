package com.projetpfe.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projetpfe.classe.Seance;
import com.projetpfe.classe.Utilisateur;

public interface SeanceRepository extends JpaRepository<Seance, Long> {

	List<Seance> findByEnseignant(Utilisateur u);

	List<Seance> findByNiveau(String niveau);

}
