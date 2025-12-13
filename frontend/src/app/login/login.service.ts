import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core"
import { BehaviorSubject, map, Observable } from "rxjs";
import { User } from "./user";
import { CONFIG } from "src/environement/environement";

@Injectable({
    providedIn:"root",
})

export class LoginService {
private currentUserSubject!: BehaviorSubject<User>
public currentUser!: Observable<User>

constructor(private http : HttpClient){
this.currentUserSubject = new BehaviorSubject<User>(
    JSON.parse(localStorage.getItem("CurrentUser")|| '{}')
);
this.currentUser = this.currentUserSubject.asObservable();

}

login(connexion:any){
    return this.http.post<any>(CONFIG.URL+"auth/login",connexion).pipe(
        map((user)=>{
            if(user && user.token){
                localStorage.setItem("CurrentUser",JSON.stringify(user))
                localStorage.setItem("Role",user.profil)
                localStorage.setItem("Email",user.email)
                localStorage.setItem("Id",user.id)
                localStorage.setItem("Token",user.token)
                this.currentUserSubject.next(user)
                return user ;
            }
            throw new Error('Invalid login response: missing token');
        })
    )

}
   afficherbyid(id:any){
    const token = localStorage.getItem("Token")
    let headers = new HttpHeaders()
    .set("Authorization","Bearer "+token)
    .set("Content-Type","application/json; charqet=utf-8")
    const options= {headers:headers}
    
    
    return this.http.get(CONFIG.URL+"user/afficherbyid?id="+id,options)

   }


   niveau(niveau:any){
    const token = localStorage.getItem("Token")
    console.log(token)
    let headers = new HttpHeaders()
    .set("Authorization","Bearer "+token)
    .set("Content-Type","application/json; charqet=utf-8")
    const options= {headers:headers}
    
    
    return this.http.post(CONFIG.URL+"user/niveau?id="+localStorage.getItem("Id")+"&niveau="+niveau,null,options)

   }


resetpassword(email:any){
        return this.http.post(CONFIG.URL+"user/renitialisermp?email="+email,null)
}


AjoutUser(user:any,profil:any){
    return this.http.post(CONFIG.URL+"user/ajout?profil="+profil,user)
}


changermp(id:any,password:any){
        
    return this.http.post(CONFIG.URL+"user/modifiermp?id="+id+"&password="+password,null)


}


}