package com.projetpfe.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class PDFService {


	    public String extractTextFromPDF(MultipartFile file) throws IOException {
	        // Charger le fichier PDF depuis MultipartFile
	        InputStream inputStream = file.getInputStream();
	        PDDocument document = PDDocument.load(inputStream);

	        // Extraire le texte du PDF
	        PDFTextStripper stripper = new PDFTextStripper();
	        String text = stripper.getText(document);
	        document.close();

	        return text;
	    }}
