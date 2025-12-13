import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from './login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!:FormGroup;
  user:any ;
  utilisateur:any ;
constructor(private service :LoginService,private router : Router){}
ngOnInit(){
this.loginForm = new FormGroup({
  studentId : new FormControl("",[Validators.required]),
  password :new FormControl("",[Validators.required]),
})

}








  connexion(){
    // Stocker l'ID étudiant dans LocalStorage
    const studentId = this.loginForm.value.studentId;
    localStorage.setItem("StudentId", studentId);

    // Envoyer username (student_id) et password au backend
    const loginData = {
      username: this.loginForm.value.studentId,
      password: this.loginForm.value.password
    };

    this.service.login(loginData).subscribe((res)=>{
      this.user=res ;

      window.alert("Connexion avec succées")
      this.service.afficherbyid(this.user.id).subscribe((res)=>{
        this.utilisateur=res


          this.router.navigate(["/Cours"])
          setTimeout(()=>{
            window.location.reload()
          },700)


      })



    })



  }

}
