package com.projetpfe.controller;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.zip.DataFormatException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.projetpfe.classe.Fichier;
import com.projetpfe.classe.Seance;
import com.projetpfe.classe.Utilisateur;
import com.projetpfe.repository.FichierRepository;
import com.projetpfe.repository.SeanceRepository;
@RestController
@RequestMapping("fichier")
@CrossOrigin("*")

public class FichierController {
@Autowired
SeanceRepository seancerepos ; 
@Autowired
FichierRepository fichierrepos ; 
@PostMapping("ajout")
public String Ajout(@RequestPart("fichier") MultipartFile file, @RequestPart("image") MultipartFile file2,  Long id, String name  ) throws IOException {
	Seance s = this.seancerepos.findById(id).get();
	Fichier f = new Fichier (); 
	f.setFichier(file.getBytes());
	f.setImage(file2.getBytes());
	f.setSeance(s);
	f.setName(name); 
	this.fichierrepos.save(f);
	
	
	
	
	return "true";
	
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


@GetMapping("pdftext")
public ResponseEntity<String> getpdftotext(Long id)throws IOException{
	 Fichier post = fichierrepos.findById(id)
	            .orElseThrow(() -> new RuntimeException("Post not found"));

	 
	    byte[] pdfBytes = post.getFichier();
String extracttest ;
try (PDDocument document = PDDocument.load(new ByteArrayInputStream(pdfBytes))){
	PDFTextStripper pdfstriper = new PDFTextStripper();
	extracttest = pdfstriper.getText(document);
}
return ResponseEntity.ok(extracttest);

	
}



@GetMapping("afficherbycours")
public List<Fichier> afficherbycours(Long id){
	Seance s = this.seancerepos.findById(id).get(); 
	return this.fichierrepos.findBySeance(s);
}





@GetMapping("afficherimagebycours")
public List<Fichier>seancebyuser(Long id){
	Seance s1 = this.seancerepos.findById(id).get(); 

	List<Fichier> newlist = new ArrayList<>();
	List<Fichier> list = this.fichierrepos.findBySeance(s1);
	
	for (int i = 0; i < list.size(); i++) {
		Fichier f = new Fichier ();
		f.setId(list.get(i).getId());
		f.setName(list.get(i).getName());
		f.setImage(decompressBytes(list.get(i).getImage()));
		newlist.add(f);
	}
return newlist ;	
}



@GetMapping("pdf")

public ResponseEntity<byte[]> getPdf(@RequestParam Long id) throws IOException {
    Fichier post = fichierrepos.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));

    byte[] pdfBytes = post.getFichier();

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_PDF);
    headers.setContentDispositionFormData("filename", id + ".pdf");
    headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

    return ResponseEntity.ok().headers(headers).body(pdfBytes);
}
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


}
