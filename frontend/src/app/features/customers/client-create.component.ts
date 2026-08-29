import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ClientService } from '../../core/services/client.service';
import { ClientRequest } from '../../core/models/client.model';

@Component({
  selector: 'app-client-create',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,

    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],

  template: `

    <div class="create-wrapper">

      <!-- HEADER -->
      <div class="header">

        <a routerLink="/customers" class="back-btn">

          <mat-icon fontSet="material-symbols-outlined">
            arrow_back
          </mat-icon>

          Retour aux clients

        </a>

        <h1 class="page-title">
          Ajouter un Client
        </h1>

        <p class="page-description">
          Créez un nouveau dossier client.
        </p>

      </div>


      <!-- FORMULAIRE -->
      <mat-card class="form-card">

        <mat-card-content>

          <form
            (ngSubmit)="submit()"
            class="client-form"
          >

            <!-- PRENOM / NOM -->
            <div class="form-row">

              <mat-form-field appearance="outline">

                <mat-label>Prénom</mat-label>

                <input
                  matInput
                  [(ngModel)]="form.firstName"
                  name="firstName"
                  required
                  maxlength="100"
                >

              </mat-form-field>


              <mat-form-field appearance="outline">

                <mat-label>Nom</mat-label>

                <input
                  matInput
                  [(ngModel)]="form.lastName"
                  name="lastName"
                  required
                  maxlength="100"
                >

              </mat-form-field>

            </div>


            <!-- GENRE / DATE NAISSANCE -->
            <div class="form-row">

              <mat-form-field appearance="outline">

                <mat-label>Genre</mat-label>

                <mat-select
                  [(ngModel)]="form.gender"
                  name="gender"
                  required
                >

                  <mat-option value="M">
                    Homme
                  </mat-option>

                  <mat-option value="F">
                    Femme
                  </mat-option>

                </mat-select>

              </mat-form-field>


              <mat-form-field appearance="outline">

                <mat-label>
                  Date de naissance
                </mat-label>

                <input
                  matInput
                  type="date"
                  [(ngModel)]="form.birthDate"
                  name="birthDate"
                  required
                >

              </mat-form-field>

            </div>


            <!-- TELEPHONE / EMAIL -->
            <div class="form-row">

              <mat-form-field appearance="outline">

                <mat-label>
                  Téléphone
                </mat-label>

                <input
                  matInput
                  [(ngModel)]="form.phone"
                  name="phone"
                  required
                  maxlength="30"
                >

              </mat-form-field>


              <mat-form-field appearance="outline">

                <mat-label>
                  Email
                </mat-label>

                <input
                  matInput
                  type="email"
                  [(ngModel)]="form.email"
                  name="email"
                  required
                  maxlength="150"
                >

              </mat-form-field>

            </div>


            <!-- ADRESSE -->
            <div class="form-row">

              <mat-form-field
                appearance="outline"
                class="full-width"
              >

                <mat-label>
                  Adresse
                </mat-label>

                <input
                  matInput
                  [(ngModel)]="form.address"
                  name="address"
                  required
                  maxlength="255"
                >

              </mat-form-field>

            </div>


            <!-- ERREUR -->
            <div
              class="error-box"
              *ngIf="error()"
            >

              <mat-icon fontSet="material-symbols-outlined">
                error
              </mat-icon>

              <span>
                {{ error() }}
              </span>

            </div>


            <!-- ACTIONS -->
            <div class="form-actions">

              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="saving()"
              >

                <mat-icon
                  fontSet="material-symbols-outlined"
                >
                  {{ saving() ? 'sync' : 'person_add' }}
                </mat-icon>

                {{ saving()
                  ? 'Enregistrement...'
                  : 'Créer le dossier client'
                }}

              </button>


              <a
                mat-button
                routerLink="/customers"
                [class.disabled-link]="saving()"
              >
                Annuler
              </a>

            </div>

          </form>

        </mat-card-content>

      </mat-card>

    </div>

  `,

  styles: [`

    .create-wrapper {
      max-width: 800px;
      margin: 0 auto;
      padding-bottom: 40px;
    }


    /* HEADER */

    .header {
      margin-bottom: 32px;
    }


    .back-btn {
      display: flex;
      align-items: center;
      gap: 8px;

      color: var(--ink-soft);

      font-weight: 500;
      font-size: 0.9rem;

      margin-bottom: 16px;

      text-decoration: none;
    }


    .back-btn:hover {
      color: var(--primary);
    }


    .page-title {
      font-size: 2rem;
      margin: 0;

      letter-spacing: -0.02em;
    }


    .page-description {
      margin-top: 8px;

      color: var(--ink-soft);

      font-size: 0.95rem;
    }


    /* CARD */

    .form-card {
      border: 1px solid var(--border);

      border-radius: 12px;

      overflow: hidden;
    }


    .client-form {
      padding: 16px 8px;
    }


    /* ROW */

    .form-row {
      display: grid;

      grid-template-columns: 1fr 1fr;

      gap: 24px;

      margin-bottom: 8px;
    }


    .form-row .full-width {
      grid-column: 1 / -1;
    }


    mat-form-field {
      width: 100%;
    }


    /* ACTIONS */

    .form-actions {
      display: flex;

      align-items: center;

      gap: 16px;

      margin-top: 24px;

      padding-top: 24px;

      border-top: 1px solid var(--border);
    }


    .form-actions button {
      height: 48px;

      padding: 0 24px;
    }


    /* ERROR */

    .error-box {
      display: flex;

      align-items: center;

      gap: 10px;

      margin-top: 16px;

      padding: 12px 16px;

      border-radius: 8px;

      color: var(--danger);

      background: rgba(220, 53, 69, 0.08);

      font-size: 0.9rem;

      font-weight: 500;
    }


    .error-box mat-icon {
      font-size: 20px;

      width: 20px;

      height: 20px;
    }


    .disabled-link {
      pointer-events: none;

      opacity: 0.5;
    }


    /* MOBILE */

    @media (max-width: 600px) {

      .create-wrapper {
        padding: 0 16px 30px;
      }


      .form-row {
        grid-template-columns: 1fr;

        gap: 0;
      }


      .form-actions {
        flex-direction: column;

        align-items: stretch;
      }


      .form-actions button {
        width: 100%;
      }

    }

  `]
})
export class ClientCreateComponent {

  /*
   * Formulaire du nouveau client
   */
  form: ClientRequest = {

    firstName: '',

    lastName: '',

    gender: 'M',

    birthDate:
      new Date().toISOString().slice(0, 10),

    phone: '',

    email: '',

    address: ''

  };


  /*
   * Etat d'enregistrement
   */
  saving = signal(false);


  /*
   * Message d'erreur
   */
  error = signal('');


  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}


  /*
   * Création du client
   */
  submit(): void {

    // Nettoyage du message précédent
    this.error.set('');


    // Protection contre double clic
    if (this.saving()) {
      return;
    }


    // Validation simple
    if (
      !this.form.firstName?.trim() ||
      !this.form.lastName?.trim() ||
      !this.form.gender ||
      !this.form.birthDate ||
      !this.form.phone?.trim() ||
      !this.form.email?.trim() ||
      !this.form.address?.trim()
    ) {

      this.error.set(
        'Veuillez remplir tous les champs obligatoires.'
      );

      return;
    }


    // Début sauvegarde
    this.saving.set(true);


    /*
     * Appel backend Spring Boot
     */
    this.clientService
      .createClient(this.form)
      .subscribe({

        next: (client) => {

          console.log(
            'Client créé avec succès :',
            client
          );


          this.saving.set(false);


          /*
           * IMPORTANT :
           *
           * On NE va PAS directement vers :
           *
           * /customers/analyse/:id
           *
           * car le nouveau client peut ne pas
           * encore posséder de véhicule/police.
           *
           * On retourne à la liste des clients.
           */

          this.router.navigate(
            ['/customers'],
            {
              state: {
                successMessage:
                  `Le client ${client.firstName} ${client.lastName} a été créé avec succès.`,
                createdClientId: client.id
              }
            }
          );

        },


        error: (err) => {

          console.error(
            'Erreur création client :',
            err
          );


          this.saving.set(false);


          /*
           * Récupération du message backend
           */
          const backendMessage =
            err?.error?.message ??
            err?.error?.detail ??
            err?.error?.error;


          if (backendMessage) {

            this.error.set(
              backendMessage
            );

          } else {

            this.error.set(
              'Erreur lors de la création du client. Veuillez réessayer.'
            );

          }

        }

      });

  }

}