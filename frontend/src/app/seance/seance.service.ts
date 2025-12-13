import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CONFIG } from "src/environement/environement";

@Injectable({
    providedIn:"root"
})
export class SeanceService{
   constructor(private http : HttpClient){}
   
   allseancebyuser(){
    const token = localStorage.getItem("Token")
    let headers = new HttpHeaders()
    .set("Authorization","Bearer "+token)
    .set("Content-Type","application/json; charqet=utf-8")
    const options= {headers:headers}
    
    
    return this.http.get(CONFIG.URL+"seance/seancebyuser?email="+localStorage.getItem("Email"),options)

   }


   allseance(){
    const token = localStorage.getItem("Token")
    let headers = new HttpHeaders()
    .set("Authorization","Bearer "+token)
    .set("Content-Type","application/json; charqet=utf-8")
    const options= {headers:headers}
    
    
    return this.http.get(CONFIG.URL+"seance/allseance",options)

   }

   
   allseancebyniveau(niveau:any){
    const token = localStorage.getItem("Token")
    let headers = new HttpHeaders()
    .set("Authorization","Bearer "+token)
    .set("Content-Type","application/json; charqet=utf-8")
    const options= {headers:headers}
    
    
    return this.http.get(CONFIG.URL+"seance/seancebyniveau?niveau="+niveau,options)

   }

}