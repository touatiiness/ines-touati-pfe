import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FichierService } from './fichier.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-fichier',
  templateUrl: './fichier.component.html',
  styleUrls: ['./fichier.component.css']
})
export class FichierComponent {
id:any ;
allfichiher:any ;

allfichiherwithimg:any ;
constructor(private router: ActivatedRoute,private service : FichierService, public sanitizer : DomSanitizer){}

ngOnInit(){
  this.id=this.router.snapshot.paramMap.get('id')
  
  this.service.afficherbycours(this.id).subscribe((res)=>{
    this.allfichiher=res;
  })
  this.service.afficherimagebycours(this.id).subscribe((res)=>{
this.allfichiherwithimg=res ;
console.log(this.allfichiherwithimg)
  })

}
loadpdf(id:any){
  this.service.getpdf(id).subscribe(blob=>{
    const url = window.URL.createObjectURL(blob);
    window.open(url)

  })

}
}
