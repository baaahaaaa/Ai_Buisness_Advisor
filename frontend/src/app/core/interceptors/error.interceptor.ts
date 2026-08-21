import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur inattendue est survenue';

      if (error.status === 0) {
        errorMessage = 'Impossible de contacter le serveur';
      } else if (error.status === 401 || error.status === 403) {
        const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/register');
        if (!isAuthRoute) {
          errorMessage = 'Session expirée, veuillez vous reconnecter';
          authService.logout();
        } else {
          errorMessage = error.status === 401
            ? 'Identifiants incorrects'
            : 'Vous n\'avez pas les droits nécessaires';
        }
      } else if (error.status >= 500) {
        errorMessage = 'Erreur serveur interne';
      }

      notificationService.error(errorMessage);
      return throwError(() => error);
    })
  );
};