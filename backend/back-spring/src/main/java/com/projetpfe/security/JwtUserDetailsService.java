package com.projetpfe.security;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.projetpfe.classe.Profil;
import com.projetpfe.classe.Utilisateur;
import com.projetpfe.repository.ProfilRepository;
import com.projetpfe.repository.UtilisateurRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class JwtUserDetailsService implements UserDetailsService {

    @Autowired
    private UtilisateurRepository userService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username.trim().isEmpty()) {
            throw new UsernameNotFoundException("username is empty");
        }

        // Chercher par username (student_id)
        Utilisateur user = userService.findByUsername(username);

        if (user == null) {
            throw new UsernameNotFoundException("User with username = " + username + " not found");
        }

        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), getGrantedAuthorities(user));
    }
@Autowired
ProfilRepository profilrepos ;  
    private List<GrantedAuthority> getGrantedAuthorities(Utilisateur user) {
    	 List<GrantedAuthority> authorities = new ArrayList<>(); 
    	 Profil auth = this.profilrepos.findByName(user.getProfil().getName());
    	 authorities.add(new SimpleGrantedAuthority(auth.getName())); 
    	     return authorities; }
}
