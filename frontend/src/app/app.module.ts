import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AcceuilComponent } from './acceuil/acceuil.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LoginComponent } from './login/login.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { CoursComponent } from './cours/cours.component';
import { QuizComponent } from './quiz/quiz.component';
import { GestionUtilisateurComponent } from './gestion-utilisateur/gestion-utilisateur.component';
import { GestionCoursComponent } from './gestion-cours/gestion-cours.component';
import { AboutComponent } from './about/about.component';
import { SeanceComponent } from './seance/seance.component';
import { PresenceComponent } from './presence/presence.component';
import { RenitailiserMpComponent } from './renitailiser-mp/renitailiser-mp.component';
import { NouveauMpComponent } from './nouveau-mp/nouveau-mp.component';
import { FichierComponent } from './fichier/fichier.component';
import { AjoutfichierComponent } from './fichier/ajoutfichier/ajoutfichier.component';
import { AiAssistantComponent } from './ai-assistant/ai-assistant.component';
import { CoursViewerComponent } from './cours-viewer/cours-viewer.component';
import { RecommendationsComponent } from './recommendations/recommendations.component';

@NgModule({
  declarations: [
    AppComponent,
    AcceuilComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    InscriptionComponent,
    CoursComponent,
    QuizComponent,
    GestionUtilisateurComponent,
    GestionCoursComponent,
    AboutComponent,
    SeanceComponent,
    PresenceComponent,
    RenitailiserMpComponent,
    NouveauMpComponent,
    FichierComponent,
    AjoutfichierComponent,
    AiAssistantComponent,
    CoursViewerComponent,
    RecommendationsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}