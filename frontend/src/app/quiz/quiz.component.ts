import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QuizChatResponse {
  response: string;
  conversation: ChatMessage[];
}

interface QuizScore {
  total: number;
  correct: number;
  percentage: number;
}

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  courseNumber: number = 0;
  partNumber: number = 0;
  messages: ChatMessage[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  private apiUrl = 'http://localhost:8001/api';
  private shouldScroll = false;

  // Nouvelles propriétés pour les recommandations
  quizCompleted: boolean = false;
  quizScore: QuizScore | null = null;
  showRecommendations: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.courseNumber = +params['course'];
      this.partNumber = +params['part'];

      // Démarrer le quiz avec l'IA
      this.startQuizWithAI();
    });

    // Exposer la fonction globalement pour onclick
    (window as any).openVideo = (course: number, part: number) => {
      this.router.navigate(['/cours-viewer'], {
        queryParams: { course, part, showVideo: true }
      });
    };
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  startQuizWithAI(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Envoyer un message vide pour que l'IA démarre le quiz
    const requestBody = {
      course_number: this.courseNumber,
      part_number: this.partNumber,
      messages: []
    };

    this.http.post<QuizChatResponse>(`${this.apiUrl}/quiz-chat`, requestBody).subscribe({
      next: (response) => {
        this.messages = response.conversation;
        this.isLoading = false;
        this.shouldScroll = true;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du démarrage du quiz. Assurez-vous que le backend est démarré.';
        console.error('Erreur:', error);
      }
    });
  }

  sendAnswer(): void {
    if (!this.userInput.trim() || this.isLoading) {
      return;
    }

    // Ajouter le message de l'utilisateur localement
    const userMessage: ChatMessage = {
      role: 'user',
      content: this.userInput
    };
    this.messages.push(userMessage);

    const inputCopy = this.userInput;
    this.userInput = '';
    this.isLoading = true;
    this.errorMessage = '';
    this.shouldScroll = true;

    // Envoyer tous les messages à l'IA
    const requestBody = {
      course_number: this.courseNumber,
      part_number: this.partNumber,
      messages: this.messages
    };

    this.http.post<QuizChatResponse>(`${this.apiUrl}/quiz-chat`, requestBody).subscribe({
      next: (response) => {
        // Remplacer avec la conversation mise à jour par l'IA
        this.messages = response.conversation;
        this.isLoading = false;
        this.shouldScroll = true;

        // Vérifier si le quiz est terminé
        this.checkQuizCompletion();
      },
      error: (error) => {
        this.errorMessage = 'Erreur de connexion au serveur.';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  checkQuizCompletion(): void {
    // Récupérer le dernier message de l'assistant
    const lastMessage = this.messages[this.messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant') return;

    const content = lastMessage.content.toLowerCase();

    // Chercher le score dans le message (format: "X/Y" ou "Score final: X/Y")
    const scoreMatch = content.match(/score\s*final\s*:\s*(\d+)\s*\/\s*(\d+)|(\d+)\s*\/\s*(\d+)\s*\(/);

    if (scoreMatch) {
      const correct = parseInt(scoreMatch[1] || scoreMatch[3]);
      const total = parseInt(scoreMatch[2] || scoreMatch[4]);
      const percentage = Math.round((correct / total) * 100);

      this.quizScore = { total, correct, percentage };
      this.quizCompleted = true;

      console.log('🎯 Quiz terminé:', this.quizScore);

      // Évaluer automatiquement le quiz
      this.evaluateQuizResult(total, correct);
    }
  }

  evaluateQuizResult(totalQuestions: number, correctAnswers: number): void {
    const studentId = localStorage.getItem("StudentId") || 'STUDENT001';

    const evaluationData = {
      student_id: studentId,
      course_number: this.courseNumber,
      part_number: this.partNumber,
      total_questions: totalQuestions,
      correct_answers: correctAnswers
    };

    this.http.post(`${this.apiUrl}/recommendations/evaluate-quiz`, evaluationData).subscribe({
      next: (result: any) => {
        console.log('✅ Quiz évalué:', result);

        if (!result.is_mastered) {
          console.log('❌ Cours non maîtrisé - Recommander la vidéo');
        }
      },
      error: (error) => {
        console.error('❌ Erreur évaluation:', error);
      }
    });
  }

  openCourseVideo(): void {
    // Construire le chemin vers la vidéo
    // Format: backend/Support_Cours_Préparation/Cours X/Partie Y/Video/
    const videoPath = `/api/video?course=${this.courseNumber}&part=${this.partNumber}`;

    // Ouvrir dans un nouvel onglet ou naviguer vers la page vidéo
    this.router.navigate(['/cours-viewer'], {
      queryParams: {
        course: this.courseNumber,
        part: this.partNumber,
        showVideo: true
      }
    });
  }

  goToRecommendations(): void {
    // Naviguer vers la page des recommandations GCN personnalisées
    this.router.navigate(['/recommendations']);
  }

  formatMessageWithVideoLink(content: string): string {
    // Détecter le texte "Cliquez ici pour regarder la vidéo du Cours X.Y"
    const videoLinkRegex = /Cliquez ici pour regarder la vidéo du Cours (\d+)\.(\d+)/gi;

    return content.replace(videoLinkRegex, (match, course, part) => {
      return `<a href="javascript:void(0)"
                 onclick="window.openVideo(${course}, ${part})"
                 class="video-link">
                 ▶️ Cliquez ici pour regarder la vidéo du Cours ${course}.${part}
              </a>`;
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendAnswer();
    }
  }

  restartQuiz(): void {
    this.messages = [];
    this.userInput = '';
    this.errorMessage = '';
    this.startQuizWithAI();
  }

  goBackToOptions(): void {
    this.router.navigate(['/Cours'], {
      queryParams: {
        course: this.courseNumber,
        part: this.partNumber
      }
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}
