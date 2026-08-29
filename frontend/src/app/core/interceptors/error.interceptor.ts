import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  catchError,
  throwError
} from 'rxjs';

import {
  NotificationService
} from '../services/notification.service';

import {
  AuthService
} from '../services/auth.service';


/**
 * ============================================================
 * GLOBAL ERROR INTERCEPTOR
 * ============================================================
 *
 * Responsabilité :
 *
 * - gérer les erreurs HTTP globales
 * - afficher une notification utilisateur
 * - gérer proprement une session réellement expirée
 * - distinguer 401 / 403 / 404 / 500 / erreur réseau
 *
 * ============================================================
 */

export const errorInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  const notificationService =
    inject(NotificationService);

  const authService =
    inject(AuthService);

  const router =
    inject(Router);


  return next(req).pipe(

    catchError(
      (error: HttpErrorResponse) => {

        let errorMessage =
          'Une erreur inattendue est survenue.';


        /**
         * ------------------------------------------------------
         * ERREUR RÉSEAU
         * ------------------------------------------------------
         *
         * status === 0
         *
         * Exemple :
         *
         * Spring Boot arrêté
         * mauvais port
         * CORS
         * connexion refusée
         */
        if (error.status === 0) {

          errorMessage =
            'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
        }


        /**
         * ------------------------------------------------------
         * 401 UNAUTHORIZED
         * ------------------------------------------------------
         *
         * Le token est absent, invalide ou expiré.
         *
         * C'est ici que la session peut être supprimée.
         */
        else if (error.status === 401) {

          const isAuthRoute =
            req.url.includes('/api/auth/login') ||
            req.url.includes('/api/auth/register');


          if (isAuthRoute) {

            errorMessage =
              'Identifiants incorrects. Vérifiez votre nom d’utilisateur et votre mot de passe.';

          } else {

            errorMessage =
              'Votre session a expiré. Veuillez vous reconnecter.';


            /**
             * Suppression de la session.
             */
            authService.logout();


            /**
             * Redirection vers la page de connexion.
             */
            router.navigate(
              ['/auth/login'],
              {
                queryParams: {
                  session: 'expired'
                }
              }
            );
          }
        }


        /**
         * ------------------------------------------------------
         * 403 FORBIDDEN
         * ------------------------------------------------------
         *
         * IMPORTANT :
         *
         * NE PAS faire logout().
         *
         * Le JWT peut être parfaitement valide.
         *
         * Le problème peut simplement être :
         *
         * ROLE_ADMIN
         * ROLE_AGENT
         * ROLE_USER
         * etc.
         */
        else if (error.status === 403) {

          errorMessage =
            'Accès refusé. Vous ne disposez pas des autorisations nécessaires.';
        }


        /**
         * ------------------------------------------------------
         * 404 NOT FOUND
         * ------------------------------------------------------
         */
        else if (error.status === 404) {

          errorMessage =
            'La ressource demandée est introuvable.';
        }


        /**
         * ------------------------------------------------------
         * 409 CONFLICT
         * ------------------------------------------------------
         */
        else if (error.status === 409) {

          errorMessage =
            'Cette opération provoque un conflit avec les données existantes.';
        }


        /**
         * ------------------------------------------------------
         * 422 VALIDATION
         * ------------------------------------------------------
         */
        else if (error.status === 422) {

          errorMessage =
            'Certaines données fournies sont invalides.';
        }


        /**
         * ------------------------------------------------------
         * 429 TOO MANY REQUESTS
         * ------------------------------------------------------
         */
        else if (error.status === 429) {

          errorMessage =
            'Trop de requêtes. Veuillez patienter quelques instants.';
        }


        /**
         * ------------------------------------------------------
         * 500+ SERVER ERROR
         * ------------------------------------------------------
         */
        else if (error.status >= 500) {

          errorMessage =
            'Une erreur interne du serveur est survenue.';
        }


        /**
         * ------------------------------------------------------
         * Notification utilisateur
         * ------------------------------------------------------
         */
        notificationService.error(
          errorMessage
        );


        /**
         * ------------------------------------------------------
         * Propagation de l'erreur
         * ------------------------------------------------------
         *
         * On ne masque jamais l'erreur.
         * Le composant appelant peut également la traiter.
         */
        return throwError(
          () => error
        );
      }
    )
  );
};