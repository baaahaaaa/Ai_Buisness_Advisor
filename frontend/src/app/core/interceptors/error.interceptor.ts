import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur inattendue est survenue';

      if (error.status === 0) {
        errorMessage = 'Impossible de contacter le serveur';
      } else if (error.status === 401) {
        errorMessage = 'Session expirée, veuillez vous reconnecter';
      } else if (error.status === 403) {
        errorMessage = 'Vous n\'avez pas les droits nécessaires';
      } else if (error.status >= 500) {
        errorMessage = 'Erreur serveur interne';
      }

      notificationService.error(errorMessage);
      return throwError(() => error);
    })
  );
};
