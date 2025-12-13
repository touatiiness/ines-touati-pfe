import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../login/login.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-nouveau-mp',
  templateUrl: './nouveau-mp.component.html',
  styleUrls: ['./nouveau-mp.component.css']
})
export class NouveauMpComponent {
  loginForm!:FormGroup;
  id:any ; 
constructor(private service :LoginService, private route : ActivatedRoute){}
ngOnInit(){

this.id = this.route.snapshot.paramMap.get('id')
console.log(this.id)

this.loginForm = new FormGroup({
  password1 : new FormControl("",[Validators.required]),
  password2 :new FormControl("",[Validators.required]),
})

}








  connexion(){
    if(this.loginForm.value.password1!=this.loginForm.value.password2){
      window.alert("verfier mot de passe")
    }
    else {
      this.service.changermp(this.id,this.loginForm.value.password1).subscribe((res)=>{
        window.alert("votre mot de passe a été change avec succées")
        window.location.reload()

      })
    }

  }

}
