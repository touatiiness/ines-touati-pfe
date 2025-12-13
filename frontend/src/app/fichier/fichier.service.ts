import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CONFIG } from "src/environement/environement";

@Injectable({
    providedIn:"root"
})
export class FichierService{
   constructor(private http : HttpClient){}
   
   afficherbycours(id:any){
    const token = localStorage.getItem("Token")
    let headers = new HttpHeaders()
    .set("Authorization","Bearer "+token)
    .set("Content-Type","application/json; charqet=utf-8")
    const options= {headers:headers}
    
    
    return this.http.get(CONFIG.URL+"fichier/afficherbycours?id="+id,options)

   }
   afficherimagebycours(id:any){
    const token = localStorage.getItem("Token")
    let headers = new HttpHeaders()
    .set("Authorization","Bearer "+token)
    .set("Content-Type","application/json; charqet=utf-8")
    const options= {headers:headers}
    
    
    return this.http.get(CONFIG.URL+"fichier/afficherimagebycours?id="+id,options)

   }
   getpdf(id:any){
    
    return this.http.get(CONFIG.URL+"fichier/pdf?id="+id,{responseType:'blob'})

   }
   

}