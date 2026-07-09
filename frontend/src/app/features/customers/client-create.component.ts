import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { ClientRequest } from '../../core/models/client.model';

@Component({
  selector: 'app-client-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>Nouveau Client</h2>
      <form (ngSubmit)="submit()" class="form">
        <label>Nom <input [(ngModel)]="form.nom" name="nom" required /></label>
        <label>Prenom <input [(ngModel)]="form.prenom" name="prenom" required /></label>
        <label>Age <input type="number" [(ngModel)]="form.age" name="age" required /></label>
        <label>Date inscription <input type="date" [(ngModel)]="form.dateInscription" name="dateInscription" required /></label>
        <label>Anciennete (annees) <input type="number" [(ngModel)]="form.ancienneteAnnees" name="ancienneteAnnees" required /></label>
        <label>Puissance vehicule <input type="number" [(ngModel)]="form.puissanceVehicule" name="puissanceVehicule" required /></label>
        <label>Km annuel <input type="number" [(ngModel)]="form.kmAnnuel" name="kmAnnuel" required /></label>
        <label>Ville <input [(ngModel)]="form.ville" name="ville" required /></label>

        <div class="actions">
          <button type="submit" [disabled]="saving()">{{ saving() ? 'Enregistrement...' : 'Creer le client' }}</button>
          <a routerLink="/customers">Annuler</a>
        </div>
        <p class="error" *ngIf="error()">{{ error() }}</p>
      </form>
    </div>
  `,
  styles: [`
    .container { max-width: 500px; padding: 24px 0; }
    .form { display: flex; flex-direction: column; gap: 14px; }
    label { display: flex; flex-direction: column; gap: 4px; font-size: 0.88rem; color: var(--ink-soft); }
    input { padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; }
    .actions { display: flex; align-items: center; gap: 16px; margin-top: 10px; }
    button { background: var(--ink); color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
    button:disabled { background: #C7CDD5; }
    .error { color: var(--danger); }
  `]
})
export class ClientCreateComponent {
  form: ClientRequest = {
    nom: '', prenom: '', age: 30, dateInscription: new Date().toISOString().slice(0, 10),
    ancienneteAnnees: 0, puissanceVehicule: 90, kmAnnuel: 10000, ville: ''
  };
  saving = signal(false);
  error = signal('');

  constructor(private clientService: ClientService, private router: Router) {}

  submit(): void {
    this.saving.set(true);
    this.clientService.createClient(this.form).subscribe({
      next: (client) => {
        this.saving.set(false);
        this.router.navigate(['/customers/analyse', client.clientId]);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set('Erreur lors de la creation du client.');
        console.error(err);
      }
    });
  }
}