import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces pour les types de données
export interface QuizEvaluation {
  student_id: string;
  course: string;
  subskill_id: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  percentage: number;
  is_mastered: boolean;
  threshold: number;
  student_profile_updated: boolean;
  message: string;
}

export interface Recommendation {
  lesson_id: string;
  lesson_name: string;
  priority_score: number;
  bloom_level: number;
  prerequisites: string[];
  difficulty_indicators: {
    struggling_students: number;
    bloom_level: number;
  };
}

export interface RecommendationResponse {
  student_id: string;
  total_non_mastered: number;
  eligible_for_study: number;
  recommendations: Recommendation[];
  all_predictions?: any[];
  message?: string;
}

export interface StudentProfile {
  student_id: string;
  sous_acquis: string[];
  total_non_mastered: number;
  statistics: {
    total_quizzes: number;
    average_score: number;
    average_percentage: number;
    mastered_count: number;
    not_mastered_count: number;
    mastery_rate: number;
  };
  recent_quizzes: any[];
}

export interface StudentStatistics {
  student_id: string;
  statistics: {
    total_quizzes: number;
    average_score: number;
    average_percentage: number;
    mastered_count: number;
    not_mastered_count: number;
    mastery_rate: number;
  };
  current_non_mastered: number;
  mastery_threshold: number;
}

export interface ModelInfo {
  gcn_available: boolean;
  model_info?: {
    total_lessons: number;
    total_edges: number;
    model_trained: boolean;
    available_data: {
      enriched_data: boolean;
      graph_data: boolean;
      forward_paths: boolean;
    };
  };
  difficulty_analysis?: any;
  mastery_threshold?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = 'http://localhost:8001/api/recommendations';

  constructor(private http: HttpClient) {}

  /**
   * Évalue un quiz et met à jour le profil de l'étudiant
   */
  evaluateQuiz(
    studentId: string,
    courseNumber: number,
    partNumber: number,
    totalQuestions: number,
    correctAnswers: number
  ): Observable<QuizEvaluation> {
    const requestBody = {
      student_id: studentId,
      course_number: courseNumber,
      part_number: partNumber,
      total_questions: totalQuestions,
      correct_answers: correctAnswers
    };

    return this.http.post<QuizEvaluation>(`${this.apiUrl}/evaluate-quiz`, requestBody);
  }

  /**
   * Obtient des recommandations personnalisées pour un étudiant
   */
  getRecommendations(
    studentId: string,
    maxRecommendations: number = 5
  ): Observable<RecommendationResponse> {
    return this.http.post<RecommendationResponse>(
      `${this.apiUrl}/student/${studentId}/recommendations`,
      { max_recommendations: maxRecommendations }
    );
  }

  /**
   * Récupère le profil complet d'un étudiant
   */
  getStudentProfile(studentId: string): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.apiUrl}/student/${studentId}/profile`);
  }

  /**
   * Récupère les statistiques d'un étudiant
   */
  getStudentStatistics(studentId: string): Observable<StudentStatistics> {
    return this.http.get<StudentStatistics>(`${this.apiUrl}/student/${studentId}/statistics`);
  }

  /**
   * Obtient les informations sur le modèle de recommandation
   */
  getModelInfo(): Observable<ModelInfo> {
    return this.http.get<ModelInfo>(`${this.apiUrl}/model-info`);
  }

  /**
   * Obtient les statistiques globales de tous les étudiants
   */
  getGlobalStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/global-statistics`);
  }

  /**
   * Helper: Formatte le niveau Bloom en description
   */
  getBloomLevelDescription(level: number): string {
    const bloomLevels: { [key: number]: string } = {
      1: 'Connaissance (Se souvenir)',
      2: 'Compréhension (Comprendre)',
      3: 'Application (Appliquer)',
      4: 'Analyse (Analyser)',
      5: 'Synthèse (Évaluer)',
      6: 'Évaluation (Créer)'
    };
    return bloomLevels[level] || 'Niveau inconnu';
  }

  /**
   * Helper: Formatte le score de priorité en étoiles
   */
  getPriorityStars(score: number): string {
    const stars = Math.round(score * 5);
    return '⭐'.repeat(stars);
  }

  /**
   * Helper: Détermine la couleur selon le score
   */
  getScoreColor(percentage: number): string {
    if (percentage >= 90) return 'green';
    if (percentage >= 80) return 'lightgreen';
    if (percentage >= 70) return 'orange';
    if (percentage >= 60) return 'orangered';
    return 'red';
  }

  /**
   * Helper: Génère un message de feedback selon le score
   */
  getFeedbackMessage(percentage: number): string {
    if (percentage >= 90) return '🎉 Excellent ! Vous maîtrisez parfaitement ce cours !';
    if (percentage >= 80) return '✅ Très bien ! Vous avez validé ce cours.';
    if (percentage >= 70) return '👍 Bon travail ! Encore un petit effort pour maîtriser ce cours.';
    if (percentage >= 60) return '⚠️ Passable. Il serait bon de réviser ce cours.';
    if (percentage >= 50) return '⚠️ Insuffisant. Ce cours nécessite plus de travail.';
    return '❌ Résultat faible. Il est recommandé de réviser ce cours en profondeur.';
  }
}
