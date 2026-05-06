import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Busca o token que salvamos no login
  const token = localStorage.getItem('heracles_token');

  // Se o token existir, clona a requisição e adiciona o Header de Autorização
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Se não houver token (ex: tela de login), segue a requisição normal
  return next(req);
};