import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
token:any ;
constructor(private route : Router){}
  ngOnInit(){
    this.token = localStorage.getItem("Token")
  }




  deconnexion(){
    localStorage.removeItem("CurrentUser")
    localStorage.removeItem("Role")
    localStorage.removeItem("Email")
    localStorage.removeItem("Id")
    localStorage.removeItem("Token")
    setTimeout(()=>{
      window.location.reload()
    },700);
    this.route.navigateByUrl("acceuil")
  }
}
