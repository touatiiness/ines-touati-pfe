package com.projetpfe.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.projetpfe.classe.Profil;

public interface ProfilRepository extends JpaRepository<Profil, Long> {

	Profil findByName(String name);
	
	@Query(nativeQuery = true,value="select * from profil where name LIKE '%E%'")
	List<Profil> listname();

	List<Profil> findByArchiverIsFalse();

	List<Profil> findByArchiverIsTrue();

}
