import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SeanceService } from 'src/app/seance/seance.service';
import { CONFIG } from 'src/environement/environement';

@Component({
  selector: 'app-ajoutfichier',
  templateUrl: './ajoutfichier.component.html',
  styleUrls: ['./ajoutfichier.component.css']
})
export class AjoutfichierComponent {
  fichierform!: FormGroup;
selectedFile!: File; 

selectedFile2!: File; 
id:any ; 
constructor(private service: SeanceService, private router: Router, private route: ActivatedRoute,private http: HttpClient) {}

ngOnInit() {
  this.id=this.route.snapshot.paramMap.get('id')

  this.fichierform = new FormGroup({
    name: new FormControl("", [Validators.required]),
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

public onFileChanged2(event: any) {
  this.selectedFile2 = event.target.files[0];
  if (this.selectedFile2) {
    console.log("Fichier sélectionné :", this.selectedFile2);
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
  uploadImage.append("fichier", this.selectedFile);
  uploadImage.append("image", this.selectedFile2);



  const email = localStorage.getItem("Email");
  const token = localStorage.getItem("Token");

  let headers = new HttpHeaders().set("Authorization", "Bearer " + token);

  this.http.post(
    CONFIG.URL +
      "fichier/ajout?name=" +
      this.fichierform.value.name +
      "&id=" +
      this.id,
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
