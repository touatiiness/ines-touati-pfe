import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  course_number: number;
  part_number: number;
  messages: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  conversation: ChatMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private apiUrl = 'http://localhost:8001/api';

  constructor(private http: HttpClient) {}

  sendMessage(courseNumber: number, partNumber: number, messages: ChatMessage[]): Observable<ChatResponse> {
    const request: ChatRequest = {
      course_number: courseNumber,
      part_number: partNumber,
      messages: messages
    };

    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request);
  }
}