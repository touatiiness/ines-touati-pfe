package com.projetpfe.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projetpfe.classe.Fichier;
import com.projetpfe.classe.Seance;

public interface FichierRepository extends JpaRepository<Fichier,Long> {

	List<Fichier> findBySeance(Seance s);

}
