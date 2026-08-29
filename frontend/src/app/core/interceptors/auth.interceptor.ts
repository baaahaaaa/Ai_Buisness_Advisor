import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);

  const token = authService.getToken();

  console.log(
    '[AuthInterceptor]',
    req.method,
    req.url,
    'JWT présent =',
    !!token
  );

  // Aucun JWT
  if (!token) {
    console.warn(
      '[AuthInterceptor] Aucun JWT trouvé'
    );

    return next(req);
  }

  // Ajouter le JWT
  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log(
    '[AuthInterceptor] Authorization: Bearer <JWT>'
  );

  return next(authenticatedRequest);
};