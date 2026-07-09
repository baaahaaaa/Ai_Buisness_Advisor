import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  info(message: string): void {
    this.snackBar.open(message, 'Fermer', { duration: 3000, panelClass: ['info-snackbar'] });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Fermer', { duration: 5000, panelClass: ['error-snackbar'] });
  }

  success(message: string): void {
    this.snackBar.open(message, 'Fermer', { duration: 3000, panelClass: ['success-snackbar'] });
  }
}
