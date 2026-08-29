import {
  ApplicationConfig,
  importProvidersFrom,
  provideZonelessChangeDetection
} from '@angular/core';

import {
  provideRouter
} from '@angular/router';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import {
  provideAnimationsAsync
} from '@angular/platform-browser/animations/async';

import {
  MatSnackBarModule
} from '@angular/material/snack-bar';

import {
  routes
} from './app.routes';

import {
  authInterceptor
} from './core/interceptors/auth.interceptor';

import {
  loadingInterceptor
} from './core/interceptors/loading.interceptor';

import {
  errorInterceptor
} from './core/interceptors/error.interceptor';


/**
 * ============================================================
 * APPLICATION CONFIGURATION
 * ============================================================
 *
 * Architecture globale :
 *
 * Angular Router
 *       +
 * HTTP Client
 *       +
 * JWT Authentication
 *       +
 * Loading state
 *       +
 * Global error handling
 *       +
 * Angular Material
 *
 * ============================================================
 */

export const appConfig: ApplicationConfig = {

  providers: [

    /**
     * ----------------------------------------------------------
     * Angular Zoneless Change Detection
     * ----------------------------------------------------------
     */
    provideZonelessChangeDetection(),


    /**
     * ----------------------------------------------------------
     * Router
     * ----------------------------------------------------------
     */
    provideRouter(
      routes
    ),


    /**
     * ----------------------------------------------------------
     * HTTP Client
     * ----------------------------------------------------------
     *
     * Ordre :
     *
     * 1. authInterceptor
     *    → ajoute le JWT
     *
     * 2. loadingInterceptor
     *    → gère l'état de chargement
     *
     * 3. errorInterceptor
     *    → gère les erreurs HTTP
     */
    provideHttpClient(

      withInterceptors([

        authInterceptor,

        loadingInterceptor,

        errorInterceptor

      ])

    ),


    /**
     * ----------------------------------------------------------
     * Angular Material animations
     * ----------------------------------------------------------
     */
    provideAnimationsAsync(),


    /**
     * ----------------------------------------------------------
     * Angular Material Snackbar
     * ----------------------------------------------------------
     */
    importProvidersFrom(

      MatSnackBarModule

    )

  ]

};