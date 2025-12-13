import { Component } from '@angular/core';
import { SeanceService } from './seance.service';
import { DomSanitizer } from '@angular/platform-browser';
import { LoginService } from '../login/login.service';
import { Router } from '@angular/router';

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

  constructor(
    private service: SeanceService,
    public sanitizer: DomSanitizer,
    private userservice: LoginService,
    private router: Router
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
  }

  goBackToParts() {
    this.selectedPart = null;
  }

  goToCours() {
    console.log(`Navigation vers Cours ${this.selectedCourse} - Part ${this.selectedPart} - Cours`);
    // Ajoutez ici la logique de navigation vers les cours
    // Par exemple: this.router.navigate(['/cours-detail', this.selectedCourse, this.selectedPart]);
  }

  goToQuiz() {
    console.log(`Navigation vers Cours ${this.selectedCourse} - Part ${this.selectedPart} - Quiz`);
    // Ajoutez ici la logique de navigation vers les quiz
    // Par exemple: this.router.navigate(['/quiz', this.selectedCourse, this.selectedPart]);
  }

  goToAI() {
    console.log(`Navigation vers Cours ${this.selectedCourse} - Part ${this.selectedPart} - AI Assistant`);
    // Ajoutez ici la logique de navigation vers l'AI assistant
    // Par exemple: this.router.navigate(['/ai-assistant', this.selectedCourse, this.selectedPart]);
  }
}
