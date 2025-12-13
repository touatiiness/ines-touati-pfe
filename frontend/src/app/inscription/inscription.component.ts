import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from '../login/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent {
  loginForm!:FormGroup;
  Profil ="Etudiant"

constructor(private service :LoginService, private router : Router){}
ngOnInit(){
this.loginForm = new FormGroup({
  email : new FormControl("",[Validators.required]),
  password :new FormControl("",[Validators.required]),
  nom : new FormControl("",[Validators.required]),
  prenom :new FormControl("",[Validators.required]), 
  numtel : new FormControl("",[Validators.required]),
  classe :new FormControl("",[Validators.required]),
})

}








enregistrer(){
  this.service.AjoutUser(this.loginForm.value,this.Profil).subscribe((res)=>{
    if(res){
      setTimeout(()=>{
        window.location.reload()
      },700)
      window.alert("Enregistrer avec succées")
      this.router.navigate(["/login"])

    }
    else {
      setTimeout(()=>{
        window.location.reload()
      },700)
      window.alert("Email existe deja")
    
    }

  })
}

}
