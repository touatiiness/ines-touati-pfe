import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcceuilComponent } from './acceuil/acceuil.component';
import { LoginComponent } from './login/login.component';
import { AboutComponent } from './about/about.component';
import { SeanceComponent } from './seance/seance.component';
import { PresenceComponent } from './presence/presence.component';
import { AjoutSeanceComponent } from './seance/ajout-seance/ajout-seance.component';
import { QuizComponent } from './quiz/quiz.component';
import { RenitailiserMpComponent } from './renitailiser-mp/renitailiser-mp.component';
import { NouveauMpComponent } from './nouveau-mp/nouveau-mp.component';
import { FichierComponent } from './fichier/fichier.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { CoursComponent } from './cours/cours.component';
import { AjoutfichierComponent } from './fichier/ajoutfichier/ajoutfichier.component';
import { AiAssistantComponent } from './ai-assistant/ai-assistant.component';
import { CoursViewerComponent } from './cours-viewer/cours-viewer.component';
import { RecommendationsComponent } from './recommendations/recommendations.component';

const routes: Routes = [
  {path:'',component:AcceuilComponent},
  {path:'acceuil',component:AcceuilComponent},
  {path:'login',component:LoginComponent},
  {path:'About',component:AboutComponent},
  {path:'Cours',component:SeanceComponent},
  {path:'seance',component:SeanceComponent},
  {path:'AjoutCours',component:CoursComponent},
  {path:'Ajout-Seance',component:AjoutSeanceComponent},
  {path:'quiz',component:QuizComponent},
  {path:'mot-de-passe-oublier',component:RenitailiserMpComponent},
  {path:'nouveaump',component:NouveauMpComponent},
  {path:'fichier',component:FichierComponent},
  {path:'ajouterfichier',component:AjoutfichierComponent},
  {path:'inscription',component:InscriptionComponent},
  {path:'Presence',component:PresenceComponent},
  {path:'ai-assistant',component:AiAssistantComponent},
  {path:'cours-viewer',component:CoursViewerComponent},
  {path:'recommendations',component:RecommendationsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }