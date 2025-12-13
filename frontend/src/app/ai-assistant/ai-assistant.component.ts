import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AiChatService, ChatMessage } from '../services/ai-chat.service';

@Component({
  selector: 'app-ai-assistant',
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.css']
})
export class AiAssistantComponent implements OnInit {
  @Input() globalMode: boolean = false; // Mode global (tous les cours)

  courseNumber: number = 0;
  partNumber: number = 0;
  messages: ChatMessage[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aiChatService: AiChatService
  ) {}

  ngOnInit() {
    if (this.globalMode) {
      // Mode global : assistant pour tous les cours
      this.courseNumber = 0;
      this.partNumber = 0;
      this.messages.push({
        role: 'assistant',
        content: `Bonjour ! Je suis votre assistant IA pour tous les cours de programmation C. Posez-moi n'importe quelle question sur les cours 1 à 8. Comment puis-je vous aider aujourd'hui ?`
      });
    } else {
      // Mode spécifique : assistant pour un cours/partie
      this.route.queryParams.subscribe(params => {
        this.courseNumber = +params['course'] || 0;
        this.partNumber = +params['part'] || 0;

        // Message de bienvenue
        this.messages.push({
          role: 'assistant',
          content: `Bonjour ! Je suis votre assistant IA pour le Cours ${this.courseNumber}, Partie ${this.partNumber}. Comment puis-je vous aider aujourd'hui ?`
        });
      });
    }
  }

  sendMessage() {
    if (!this.userInput.trim()) {
      return;
    }

    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      role: 'user',
      content: this.userInput
    };
    this.messages.push(userMessage);

    const inputCopy = this.userInput;
    this.userInput = '';
    this.isLoading = true;
    this.errorMessage = '';

    // Envoyer au backend
    this.aiChatService.sendMessage(
      this.courseNumber,
      this.partNumber,
      this.messages
    ).subscribe({
      next: (response) => {
        this.messages = response.conversation;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur de connexion au serveur. Assurez-vous que le backend est démarré.';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  goBackToOptions(): void {
    if (this.globalMode) {
      // En mode global, on ne navigue pas (géré par le parent)
      return;
    }

    // Retourner vers l'interface avec les 3 options (Cours/Quiz/AI)
    this.router.navigate(['/Cours'], {
      queryParams: {
        course: this.courseNumber,
        part: this.partNumber
      }
    });
  }
}
