package com.projetpfe.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projetpfe.classe.Profil;
import com.projetpfe.classe.Utilisateur;
import com.projetpfe.repository.ProfilRepository;
import com.projetpfe.repository.UtilisateurRepository;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProfilRepository profilRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Vérifier si les profils existent déjà
        if (profilRepository.count() == 0) {
            System.out.println("=== Initialisation des profils ===");

            Profil etudiant = new Profil();
            etudiant.setName("Etudiant");
            etudiant.setArchiver(false);
            profilRepository.save(etudiant);

            Profil enseignant = new Profil();
            enseignant.setName("Enseignant");
            enseignant.setArchiver(false);
            profilRepository.save(enseignant);

            System.out.println("✓ Profils créés: Etudiant, Enseignant");
        }

        // Charger et initialiser les étudiants depuis students_profiles.json
        if (utilisateurRepository.count() == 0) {
            System.out.println("=== Initialisation des étudiants depuis students_profiles.json ===");

            try {
                ObjectMapper mapper = new ObjectMapper();
                List<Map<String, Object>> studentsData;

                // Charger depuis resources/students_profiles.json
                try {
                    ClassPathResource resource = new ClassPathResource("students_profiles.json");
                    studentsData = mapper.readValue(
                        resource.getInputStream(),
                        new TypeReference<List<Map<String, Object>>>() {}
                    );
                    System.out.println("✓ Fichier students_profiles.json chargé depuis resources/");
                } catch (Exception e) {
                    System.out.println("⚠️ Impossible de charger students_profiles.json: " + e.getMessage());
                    System.out.println("   Création d'utilisateurs de test par défaut...");
                    createDefaultTestUsers();
                    return;
                }

                Profil etudiantProfil = profilRepository.findByName("Etudiant");
                int count = 0;

                // Créer un utilisateur pour chaque student_id dans le JSON
                for (Map<String, Object> studentData : studentsData) {
                    String studentId = (String) studentData.get("student_id");

                    if (studentId != null && !studentId.isEmpty()) {
                        Utilisateur user = new Utilisateur();
                        user.setUsername(studentId);  // student_id comme username
                        user.setEmail(studentId + "@student.com");  // Email généré
                        user.setPassword(passwordEncoder.encode("123456"));  // Mot de passe par défaut
                        user.setNom("Student");
                        user.setPrenom(studentId);
                        user.setClasse("3eme annee");
                        user.setNiveau("L3");
                        user.setArchiver(false);
                        user.setProfil(etudiantProfil);

                        utilisateurRepository.save(user);
                        count++;
                    }
                }

                System.out.println("✓ " + count + " étudiants créés depuis students_profiles.json");
                System.out.println("  Mot de passe par défaut pour tous: 123456");
                System.out.println("  Login avec: student_id + password");

            } catch (Exception e) {
                System.err.println("❌ Erreur lors du chargement de students_profiles.json: " + e.getMessage());
                System.out.println("   Création d'utilisateurs de test par défaut...");
                createDefaultTestUsers();
            }
        } else {
            System.out.println("=== Les données existent déjà ===");
            System.out.println("   Total utilisateurs: " + utilisateurRepository.count());
        }
    }

    /**
     * Crée des utilisateurs de test par défaut si students_profiles.json n'est pas disponible
     */
    private void createDefaultTestUsers() {
        Profil etudiantProfil = profilRepository.findByName("Etudiant");
        Profil enseignantProfil = profilRepository.findByName("Enseignant");

        // Utilisateur 1: Student ID 422001
        Utilisateur user1 = new Utilisateur();
        user1.setUsername("422001");
        user1.setNom("Benali");
        user1.setPrenom("Ahmed");
        user1.setEmail("422001@student.com");
        user1.setPassword(passwordEncoder.encode("123456"));
        user1.setNumtel(422001L);
        user1.setClasse("3eme annee");
        user1.setProfil(etudiantProfil);
        user1.setArchiver(false);
        utilisateurRepository.save(user1);

        // Utilisateur 2: Student ID 270002
        Utilisateur user2 = new Utilisateur();
        user2.setUsername("270002");
        user2.setNom("Trabelsi");
        user2.setPrenom("Sami");
        user2.setEmail("270002@student.com");
        user2.setPassword(passwordEncoder.encode("123456"));
        user2.setNumtel(270002L);
        user2.setClasse("3eme annee");
        user2.setProfil(etudiantProfil);
        user2.setArchiver(false);
        utilisateurRepository.save(user2);

        // Utilisateur 3: Student ID 783003
        Utilisateur user3 = new Utilisateur();
        user3.setUsername("783003");
        user3.setNom("Khlifi");
        user3.setPrenom("Mariem");
        user3.setEmail("783003@student.com");
        user3.setPassword(passwordEncoder.encode("123456"));
        user3.setNumtel(783003L);
        user3.setClasse("3eme annee");
        user3.setProfil(etudiantProfil);
        user3.setArchiver(false);
        utilisateurRepository.save(user3);

        // Enseignant
        Utilisateur user4 = new Utilisateur();
        user4.setUsername("PROF001");
        user4.setNom("Khalil");
        user4.setPrenom("Fatma");
        user4.setEmail("enseignant@test.com");
        user4.setPassword(passwordEncoder.encode("123456"));
        user4.setNumtel(99887766L);
        user4.setClasse("Enseignant");
        user4.setProfil(enseignantProfil);
        user4.setArchiver(false);
        utilisateurRepository.save(user4);

        System.out.println("✓ 4 utilisateurs de test par défaut créés");
        System.out.println("  - Student ID: 422001, Password: 123456");
        System.out.println("  - Student ID: 270002, Password: 123456");
        System.out.println("  - Student ID: 783003, Password: 123456");
        System.out.println("  - Student ID: PROF001, Password: 123456");
    }
}
