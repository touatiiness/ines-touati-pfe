package com.projetpfe.classe;

import lombok.Data;
import lombok.NonNull;

@Data
public class LoginResponse {
	@NonNull
	private String token ;
	@NonNull
	private String type ;
	@NonNull
	private String message ; 
	@NonNull
	private String profil ;
	@NonNull
	private String email ;
	@NonNull
	private Long id ; 
	
	
}
