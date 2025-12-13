package com.projetpfe.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.zip.DataFormatException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.projetpfe.classe.Seance;
import com.projetpfe.classe.Utilisateur;
import com.projetpfe.repository.SeanceRepository;
import com.projetpfe.repository.UtilisateurRepository;

@RestController
@RequestMapping("seance")
@CrossOrigin("*")
public class SeanceController {

@Autowired
SeanceRepository seancerepos ; 
@Autowired
UtilisateurRepository userrepos ; 

@PostMapping("ajout")
public String Ajout(@RequestPart("image") MultipartFile file,String lien , String titre,
		String niveau ,String description ,String email) throws IOException {


	Utilisateur u = this.userrepos.findByEmail(email);

	Seance s = new Seance ();
	s.setDescription(description);
	s.setEnseignant(u);
	s.setLien(lien);
	s.setNiveau(niveau);
	s.setTitre(titre);
	s.setImage(compressBytes(file.getBytes()));
	s.setDate(new Date(System.currentTimeMillis()));
	this.seancerepos.save(s);
	
	
	
	
	return "true";
	
}

@GetMapping("seancebyuser")
public List<Seance>seancebyuser(String email){
	Utilisateur u = this.userrepos.findByEmail(email);

	List<Seance> newlist = new ArrayList<>();
	List<Seance> list = this.seancerepos.findByEnseignant(u);
	
	for (int i = 0; i < list.size(); i++) {
		Seance s = new Seance ();
		s.setDate(list.get(i).getDate());
		s.setDescription(list.get(i).getDescription());
		s.setEnseignant(list.get(i).getEnseignant());
		s.setId(list.get(i).getId());
		s.setLien(list.get(i).getLien());
		s.setNiveau(list.get(i).getNiveau());
		s.setTitre(list.get(i).getNiveau());
		s.setImage(decompressBytes(list.get(i).getImage()));
		newlist.add(s);
	}
return newlist ;	
}



@GetMapping("allseance")
public List<Seance>allseance(){

	List<Seance> newlist = new ArrayList<>();
	List<Seance> list = this.seancerepos.findAll();
	
	for (int i = 0; i < list.size(); i++) {
		Seance s = new Seance ();
		s.setDate(list.get(i).getDate());
		s.setDescription(list.get(i).getDescription());
		s.setEnseignant(list.get(i).getEnseignant());
		s.setId(list.get(i).getId());
		s.setLien(list.get(i).getLien());
		s.setNiveau(list.get(i).getNiveau());
		s.setTitre(list.get(i).getNiveau());
		s.setImage(decompressBytes(list.get(i).getImage()));
		newlist.add(s);
	}
return newlist ;	
}


@GetMapping("seancebyniveau")
public List<Seance>seancebyniveau(String niveau){

	List<Seance> newlist = new ArrayList<>();
	List<Seance> list = this.seancerepos.findByNiveau(niveau);
	
	for (int i = 0; i < list.size(); i++) {
		Seance s = new Seance ();
		s.setDate(list.get(i).getDate());
		s.setDescription(list.get(i).getDescription());
		s.setEnseignant(list.get(i).getEnseignant());
		s.setId(list.get(i).getId());
		s.setLien(list.get(i).getLien());
		s.setNiveau(list.get(i).getNiveau());
		s.setTitre(list.get(i).getNiveau());
		s.setImage(decompressBytes(list.get(i).getImage()));
		newlist.add(s);
	}
return newlist ;	
}



public static byte[] decompressBytes(byte[] data) {
	Inflater inflater = new Inflater();
	inflater.setInput(data);
	ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
	byte[] buffer = new byte[1024];
	try {
		while (!inflater.finished()) {
			int count = inflater.inflate(buffer);
			outputStream.write(buffer, 0, count);
		}
		outputStream.close();
	} catch (IOException ioe) {
	} catch (DataFormatException e) {
	}
	return outputStream.toByteArray();
}

/*public ResponseEntity<byte[]> getPdf(@RequestParam Long id) throws IOException {
    Post post = postrepos.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));

    byte[] pdfBytes = post.getPicByte();

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_PDF);
    headers.setContentDispositionFormData("filename", id + ".pdf");
    headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

    return ResponseEntity.ok().headers(headers).body(pdfBytes);
}
*/
public static byte[] compressBytes(byte[] data) {
	Deflater deflater = new Deflater();
	deflater.setInput(data);
	deflater.finish();

	ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
	byte[] buffer = new byte[1024];
	while (!deflater.finished()) {
		int count = deflater.deflate(buffer);
		outputStream.write(buffer, 0, count);
	}
	try {
		outputStream.close();
	} catch (IOException e) {
	}
	return outputStream.toByteArray();
}

@GetMapping("afficherbyuser")
public List<Seance> afficherbyuser(String email){
	Utilisateur u = this.userrepos.findByEmail(email);
	return this.seancerepos.findByEnseignant(u);
}
}
