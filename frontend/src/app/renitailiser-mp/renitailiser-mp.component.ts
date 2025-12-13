import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-renitailiser-mp',
  templateUrl: './renitailiser-mp.component.html',
  styleUrls: ['./renitailiser-mp.component.css']
})
export class RenitailiserMpComponent {
  loginForm!:FormGroup
constructor(private service:LoginService){}
ngOnInit(){
  this.loginForm = new FormGroup({
    email : new FormControl("",[Validators.required]),
  })
  
}



  envoyer(){
    this.service.resetpassword(this.loginForm.value.email).subscribe((res)=>{
      window.alert("Verifier votre boite email")
    })
  }

}
