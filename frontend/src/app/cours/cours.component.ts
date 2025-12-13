import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SeanceService } from '../seance/seance.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CONFIG } from 'src/environement/environement';

@Component({
  selector: 'app-cours',
  templateUrl: './cours.component.html',
  styleUrls: ['./cours.component.css']
})
export class CoursComponent {
  coursform!: FormGroup;
selectedFile!: File; 

constructor(private service: SeanceService, private router: Router, private http: HttpClient) {}

ngOnInit() {
  this.coursform = new FormGroup({
    lien: new FormControl("", [Validators.required]),
    titre: new FormControl("", [Validators.required]),
    niveau: new FormControl("", [Validators.required]),
    description: new FormControl("", [Validators.required]), 
  });
}

public onFileChanged(event: any) {
  this.selectedFile = event.target.files[0];
  if (this.selectedFile) {
    console.log("Fichier sélectionné :", this.selectedFile);
  } else {
    console.log("Aucun fichier sélectionné");
  }
}

enregistrer() {
  if (!this.selectedFile) {
    console.error("Aucun fichier sélectionné !");
    return;
  }

  const uploadImage = new FormData();
  uploadImage.append("image", this.selectedFile);


  const email = localStorage.getItem("Email");
  const token = localStorage.getItem("Token");

  let headers = new HttpHeaders().set("Authorization", "Bearer " + token);

  this.http.post(
    CONFIG.URL +
      "seance/ajout?lien=" +
      this.coursform.value.lien +
      "&titre=" +
      this.coursform.value.titre +
      "&niveau=" +
      this.coursform.value.niveau +
      "&description=" +
      this.coursform.value.description +
      "&email=" +
      email,
    uploadImage,
    {
      observe: "response",
      reportProgress: true,
      headers: headers,
    }
  ).subscribe({
    next: (res) => {
      window.alert("Enregistre Avec succées")

      console.log("Réponse du serveur :", res);
    },
    error: (err) => {
      console.error("Erreur lors de l'envoi :", err);
    }
  });
}




}
    

