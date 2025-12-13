import { Component } from '@angular/core';
import { SeanceService } from './seance.service';
import { DomSanitizer } from '@angular/platform-browser';
import { LoginService } from '../login/login.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-seance',
  templateUrl: './seance.component.html',
  styleUrls: ['./seance.component.css']
})
export class SeanceComponent {
  allseance: any;
  profil: any;
  allseancebyniveau: any;
  user: any;
  allseances: any;
  showCoursesList: boolean = false;
  selectedCourse: number | null = null;
  selectedPart: number | null = null;
  showRecommendations: boolean = false; // Pour afficher les recommandations
  showAIAssistant: boolean = false; // Pour afficher l'AI Assistant global

  // Configuration des cours avec titres et parties
  coursesConfig: any = {
    1: {
      title: "Lecture & Écriture des données",
      parts: [
        { number: 1, title: "Étapes de résolution d'un problème en programmation" },
        { number: 2, title: "Structure d'un programme C" },
        { number: 3, title: "Les variables" },
        { number: 4, title: "La portée des variables" },
        { number: 5, title: "Affichage des données" },
        { number: 6, title: "Opérateurs de base" },
        { number: 7, title: "Les priorités" }
      ]
    },
    2: {
      title: "Les structures conditionnelles",
      parts: [
        { number: 1, title: "L‘instruction if .... else" },
        { number: 2, title: "L’instruction switch" },
        { number: 3, title: "Partie 2.3" }
      ]
    },
    3: {
      title: "Les structures itératives",
      parts: [
        { number: 1, title: "La boucle « for »" },
        { number: 2, title: "La boucle do..while" },
        { number: 3, title: "La boucle while" },
        { number: 4, title: "es structures itératives " }
        
      ]
    },
    4: {
      title: "Les tableaux unidimensionnels et bidimensionnels",
      parts: [
        { number: 1, title: "Les tableaux unidimensionnels" },
        { number: 2, title: "Ajout d’un élément dans le tableau" },
        { number: 3, title: "Suppression  d’un élément dans le tableau" },
        { number: 4, title: "opération de parcours " },
        { number: 5, title: "Recherche d’un élément dans le tableau" },
        { number: 6, title: "Ordonner un tableau" },
        { number: 7, title: "Appliquer la recherche dichotomique" },
        { number: 8, title: "Identifier les types des tableaux" }
      ]
    },
    5: {
      title: "Les chaînes de caractères",
      parts: [
        { number: 1, title: "Définir une chaîne de caractères " },
        { number: 2, title: "Déclaration d'une chaine de caractères" },
        { number: 3, title: "initialisation d'une chaîne de caractères" },
        { number: 4, title: "Accès aux éléments d’une chaîne" },
        { number: 5, title: "Saisie d’une chaîne de caractères" },
        { number: 6, title: "Fonctions de manipulation de chaînes" },
        { number: 7, title: "Tableau de chaînes" }
      ]
    },
    6: {
      title: "Les structures",
      parts: [
        { number: 1, title: "Utilisation d’une structure " },
        { number: 2, title: "Utilisation d’une structure" },
        { number: 3, title: "Tableaux de structures" }
      ]
    },
    7: {
      title: "Les pointeurs",
      parts: [
        { number: 1, title: "Intérêt des pointeurs " },
        { number: 2, title: "Fonctions et pointeurs " },
        { number: 3, title: "Pointeurs et tableaux" }
      ]
    },
    8: {
      title: "Les fonctions",
      parts: [
        { number: 1, title: "Définition et utilité" },
        { number: 2, title: "Définition d’une fonction" },
        { number: 3, title: "Appel d’une fonction" },
        { number: 4, title: "Paramètres effectifs & paramètres formels" },
        { number: 5, title: "Modes de passage des paramètres" },
        { number: 6, title: "Fonctions et tableaux" }
      ]
    }
  }

  constructor(
    private service: SeanceService,
    public sanitizer: DomSanitizer,
    private userservice: LoginService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.service.allseance().subscribe((res) => {
      this.allseances = res;
    });

    this.profil = localStorage.getItem("Role");

    this.userservice.afficherbyid(localStorage.getItem("Id")).subscribe((res) => {
      this.user = res;

      this.service.allseancebyniveau(this.user.niveau).subscribe((res) => {
        this.allseancebyniveau = res;
      });
    });

    this.service.allseancebyuser().subscribe((res) => {
      this.allseance = res;
    });

    // Gérer le retour depuis cours-viewer ou ai-assistant
    this.route.queryParams.subscribe(params => {
      if (params['course'] && params['part']) {
        this.selectedCourse = +params['course'];
        this.selectedPart = +params['part'];
      }
    });
  }

  selectCourse(courseNumber: number) {
    this.selectedCourse = courseNumber;
    this.selectedPart = null; // Réinitialiser la partie sélectionnée
    console.log('Cours sélectionné:', courseNumber);
  }

  selectPart(partNumber: number) {
    this.selectedPart = partNumber;
    console.log('Part sélectionnée:', partNumber);
  }

  goBack() {
    this.selectedCourse = null;
    this.selectedPart = null;
    this.showRecommendations = false;
    this.showAIAssistant = false;
  }

  goBackToParts() {
    this.selectedPart = null;
  }

  // Afficher les recommandations
  showRecommendationsView() {
    this.showRecommendations = true;
    this.selectedCourse = null;
    this.selectedPart = null;
  }

  // Retour depuis les recommandations
  goBackFromRecommendations() {
    this.showRecommendations = false;
  }

  // Ouvrir l'AI Assistant Global
  openGlobalAI() {
    this.showAIAssistant = true;
    this.selectedCourse = null;
    this.selectedPart = null;
    this.showRecommendations = false;
  }

  // Fermer l'AI Assistant Global
  closeGlobalAI() {
    this.showAIAssistant = false;
  }

  goToCours() {
    console.log(`Navigation vers Cours ${this.selectedCourse} - Part ${this.selectedPart} - Cours`);
    this.router.navigate(['/cours-viewer'], {
      queryParams: {
        course: this.selectedCourse,
        part: this.selectedPart
      }
    });
  }

  goToQuiz() {
    console.log(`Navigation vers Cours ${this.selectedCourse} - Part ${this.selectedPart} - Quiz`);
    this.router.navigate(['/quiz'], {
      queryParams: {
        course: this.selectedCourse,
        part: this.selectedPart
      }
    });
  }
}
