# API de usuários — Express + TypeScript

CRUD de usuários em memória, feito no exercício 5.

## Como executar

```
npm install
npm run dev
```

Servidor em `http://localhost:3000`.

## Rotas

| Método | Rota         | Retorno                       |
| ------ | ------------ | ----------------------------- |
| GET    | /users       | 200 com a lista               |
| GET    | /users/:id   | 200 com o usuário ou 404      |
| POST   | /users       | 201 com o usuário criado, 400 |
| PUT    | /users/:id   | 200 com o atualizado, 400/404 |
| DELETE | /users/:id   | 200 com o removido ou 404     |
