# heracles-web

Console administrativo do Herácles: gestão de alunos e de fichas de treino.
Angular 20 com componentes standalone, change detection zoneless e signals.

## Pré-requisitos

- Node 22 ou superior
- A [heracles-api](../heracles-api) rodando em `http://localhost:8080`

O frontend **não** funciona sozinho: toda a tela depende da API, e a partir da
tela de login isso é imediato.

## Subindo o projeto

```bash
npm install
npm start
```

A aplicação sobe em `http://localhost:4200`.

Acesse por `http://localhost:4200`, não por `http://127.0.0.1:4200`: a API
libera CORS por origem, e `127.0.0.1` é uma origem diferente de `localhost`.
Se preferir o IP, acrescente-o a `CORS_ALLOWED_ORIGINS` na API.

Para o primeiro login, use as credenciais de desenvolvimento descritas no
README da API.

## Scripts

| Comando            | O que faz                                              |
|--------------------|--------------------------------------------------------|
| `npm start`        | Servidor de desenvolvimento em `:4200`                  |
| `npm run build`    | Build de produção em `dist/`                            |
| `npm test`         | Testes unitários em modo watch                          |
| `npm run test:ci`  | Testes uma única vez, em Chrome headless                |
| `npm run typecheck`| Verifica os tipos da aplicação **e** dos specs          |

`typecheck` roda os dois `tsconfig` de propósito: os specs são compilados por
um projeto separado, e é fácil quebrá-los sem que o build da aplicação perceba.

## Configuração de ambiente

A URL da API vive em `src/environments/`:

- `environment.ts` — desenvolvimento, aponta para `http://localhost:8080/api`
- `environment.prod.ts` — produção, aponta para `/api` (mesma origem, atrás de proxy reverso)

O build de produção troca um pelo outro via `fileReplacements` no
`angular.json`. Nenhum componente monta URL de API por conta própria: quem
conhece os endpoints são os serviços em `src/app/core/services/`.

## Estrutura

```
src/app/
  core/
    models/         interfaces que espelham os DTOs da API
    services/       um serviço por recurso; donos das URLs
    guards/         authGuard protege a área logada
    interceptors/   anexa o bearer token e trata 401
  pages/
    login/          formulário reativo de autenticação
    dashboard/      casca com menu lateral e barra superior
    dashboard-home/ cartões de indicadores
    alunos/         listagem, cadastro e vínculo de fichas
    treinos/        listagem, edição e detalhes das fichas
```

## Autenticação

O `AuthService` guarda o token no `localStorage` e expõe o usuário logado como
um signal. O `authGuard` protege toda a árvore `/dashboard`, e o
`authInterceptor` anexa o token e derruba a sessão quando a API responde 401 —
o usuário volta ao login com aviso de sessão expirada.

## Estilo

Angular Material (tema M3) mais utilitários Tailwind v4. O Tailwind é carregado
por `src/tailwind.css`, listado depois de `src/styles.scss` no `angular.json`,
para que as utilidades vençam os padrões do Material e o Sass não precise
processar a regra `@import`.
