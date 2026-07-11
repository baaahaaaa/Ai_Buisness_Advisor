import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ClientService } from '../../core/services/client.service';
import { AnalyseResponse } from '../../core/models/analyse.model';

@Component({
  selector: 'app-client-analyse',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule, MatCardModule,
    MatIconModule, MatButtonModule, MatInputModule,
    MatFormFieldModule, MatDividerModule, MatProgressBarModule
  ],
  templateUrl: './client-analyse.component.html',
  styleUrl: './client-analyse.component.css'
})
export class ClientAnalyseComponent implements OnInit {
  clientId!: number;
  analyse = signal<AnalyseResponse | null>(null);
  loading = signal(true);
  error = signal('');

  question = signal('');
  chatHistory = signal<{ question: string; answer: string }[]>([]);
  chatLoading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAnalyse();
  }

  loadAnalyse(): void {
    this.loading.set(true);
    this.clientService.analyseClient(this.clientId).subscribe({
      next: (data) => {
        this.analyse.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement de l\'analyse');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  askQuestion(): void {
    const q = this.question().trim();
    if (!q) return;

    this.chatLoading.set(true);
    this.clientService.chatWithAdvisor(this.clientId, q).subscribe({
      next: (res) => {
        this.chatHistory.update(history => [
          ...history,
          { question: q, answer: res.answer || res.reponse || 'Pas de réponse' }
        ]);
        this.question.set('');
        this.chatLoading.set(false);
      },
      error: (err) => {
        this.chatHistory.update(history => [
          ...history,
          { question: q, answer: 'Erreur : impossible de contacter l\'assistant IA.' }
        ]);
        this.chatLoading.set(false);
        console.error(err);
      }
    });
  }

  riskNeedleRotation(score: number): number {
    return -90 + (score / 100) * 180;
  }
}
