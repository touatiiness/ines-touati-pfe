import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecommendationService, Recommendation, StudentProfile } from '../services/recommendation.service';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
})
export class RecommendationsComponent implements OnInit {
  @Output() onBack = new EventEmitter<void>(); // Événement pour retour

  studentId: string = '';
  recommendations: Recommendation[] = [];
  studentProfile: StudentProfile | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  courseNumber: number = 0;
  partNumber: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public recommendationService: RecommendationService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID étudiant depuis localStorage (StudentId saisi au login)
    const studentIdFromStorage = localStorage.getItem("StudentId");

    // Récupérer les paramètres de la route (optionnels)
    this.route.queryParams.subscribe(params => {
      this.studentId = params['student'] || studentIdFromStorage || '26';
      this.courseNumber = +params['course'] || 0;
      this.partNumber = +params['part'] || 0;

      console.log('🎯 Student ID chargé:', this.studentId);

      // Charger les données
      this.loadStudentData();
    });
  }

  loadStudentData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Charger le profil
    this.recommendationService.getStudentProfile(this.studentId).subscribe({
      next: (profile) => {
        this.studentProfile = profile;
        console.log('✅ Profil chargé:', profile);

        // Charger les recommandations
        this.loadRecommendations();
      },
      error: (error) => {
        console.error('❌ Erreur chargement profil:', error);
        this.errorMessage = 'Erreur lors du chargement du profil étudiant.';
        this.isLoading = false;
      }
    });
  }

  loadRecommendations(): void {
    this.recommendationService.getRecommendations(this.studentId, 5).subscribe({
      next: (response) => {
        this.recommendations = response.recommendations || [];
        this.isLoading = false;
        console.log('✅ Recommandations chargées:', this.recommendations);
      },
      error: (error) => {
        console.error('❌ Erreur chargement recommandations:', error);
        this.errorMessage = 'Erreur lors du chargement des recommandations.';
        this.isLoading = false;
      }
    });
  }

  goBackToOptions(): void {
    // Émettre l'événement pour retourner à la page seance
    this.onBack.emit();
  }

  goToCourse(lessonId: string): void {
    // Parser le lesson_id (ex: "1.3" → course=1, part=3)
    const parts = lessonId.split('.');
    if (parts.length === 2) {
      const course = parseInt(parts[0]);
      const part = parseInt(parts[1]);

      this.router.navigate(['/Cours'], {
        queryParams: {
          course: course,
          part: part
        }
      });
    }
  }

  getPriorityStars(score: number): string {
    return this.recommendationService.getPriorityStars(score);
  }

  getBloomDescription(level: number): string {
    return this.recommendationService.getBloomLevelDescription(level);
  }

  getProgressPercentage(): number {
    if (!this.studentProfile) return 0;

    const totalLessons = 39; // Total de sous-acquis
    const mastered = totalLessons - this.studentProfile.total_non_mastered;
    return (mastered / totalLessons) * 100;
  }

  getDifficultyClass(strugglingCount: number): string {
    if (strugglingCount > 15) return 'very-difficult';
    if (strugglingCount > 10) return 'difficult';
    if (strugglingCount > 5) return 'moderate';
    return 'easy';
  }
}
