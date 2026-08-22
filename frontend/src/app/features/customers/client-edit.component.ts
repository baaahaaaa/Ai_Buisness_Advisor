import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ClientService } from '../../core/services/client.service';
import { ClientRequest } from '../../core/models/client.model';

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatProgressBarModule
  ],
  template: `
    <div class="create-wrapper">
      <div class="header">
        <a routerLink="/customers" class="back-btn">
          <mat-icon fontSet="material-symbols-outlined">arrow_back</mat-icon>
          Retour aux clients
        </a>
        <h1 class="page-title">Modifier le Client #{{ clientId }}</h1>
      </div>

      <mat-progress-bar mode="indeterminate" *ngIf="loading()"></mat-progress-bar>

      <mat-card class="form-card" *ngIf="!loading()">
        <mat-card-content>
          <form (ngSubmit)="submit()" class="client-form">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Prenom</mat-label>
                <input matInput [(ngModel)]="form.firstName" name="firstName" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput [(ngModel)]="form.lastName" name="lastName" required>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Genre</mat-label>
                <mat-select [(ngModel)]="form.gender" name="gender" required>
                  <mat-option value="M">Homme</mat-option>
                  <mat-option value="F">Femme</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Date de naissance</mat-label>
                <input matInput type="date" [(ngModel)]="form.birthDate" name="birthDate" required>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Telephone</mat-label>
                <input matInput [(ngModel)]="form.phone" name="phone" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" [(ngModel)]="form.email" name="email" required>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Adresse</mat-label>
                <input matInput [(ngModel)]="form.address" name="address" required>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
                <mat-icon fontSet="material-symbols-outlined">{{ saving() ? 'sync' : 'save' }}</mat-icon>
                {{ saving() ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
              <a mat-button routerLink="/customers">Annuler</a>
            </div>
            <p class="error-msg" *ngIf="error()">{{ error() }}</p>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .create-wrapper { max-width: 800px; margin: 0 auto; }
    .header { margin-bottom: 32px; }
    .back-btn {
      display: flex; align-items: center; gap: 8px; color: var(--ink-soft);
      font-weight: 500; font-size: 0.9rem; margin-bottom: 16px;
    }
    .page-title { font-size: 2rem; margin: 0; letter-spacing: -0.02em; }

    .form-card { border: 1px solid var(--border); }
    .client-form { padding: 16px 8px; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 8px; }
    .form-row .full-width { grid-column: 1 / -1; }
    mat-form-field { width: 100%; }

    .form-actions { display: flex; align-items: center; gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }
    .form-actions button { height: 48px; padding: 0 24px; }

    .error-msg { color: var(--danger); margin-top: 16px; font-size: 0.9rem; font-weight: 500; }

    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; gap: 0; }
    }
  `]
})
export class ClientEditComponent implements OnInit {
  clientId!: number;
  form: ClientRequest = {
    firstName: '', lastName: '', gender: 'M',
    birthDate: new Date().toISOString().slice(0, 10),
    phone: '', email: '', address: ''
  };
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.clientService.getClientById(this.clientId).subscribe({
      next: (client) => {
        this.form = {
          firstName: client.firstName,
          lastName: client.lastName,
          gender: client.gender,
          birthDate: client.birthDate,
          phone: client.phone,
          email: client.email,
          address: client.address
        };
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Impossible de charger ce client.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  submit(): void {
    this.saving.set(true);
    this.clientService.updateClient(this.clientId, this.form).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set('Erreur lors de la mise a jour du client.');
        console.error(err);
      }
    });
  }
}
