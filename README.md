# Exercícios 7 e 8 — Express + TypeScript

Continuação da API CRUD do exercício 5. O branch `main` guarda a versão antiga,
com as rotas mexendo direto no array, e o branch `exercicios-7-e-8` traz as duas
mudanças pedidas: um middleware de log tipado e a classe `UserService`.

## Como executar

```
npm install
npm run typecheck
npm run dev
```

Servidor em `http://localhost:3000`.

## Estrutura

```
src/
├── middlewares/
│   └── logger.middleware.ts
├── models/
│   └── user.ts
├── services/
│   └── user.service.ts
└── server.ts
```

## Rotas

| Método | Rota       | Respostas                                        |
| ------ | ---------- | ------------------------------------------------ |
| GET    | /users     | 200 com a lista                                  |
| GET    | /users/:id | 200 com o usuário, 404 se não existir            |
| POST   | /users     | 201 com o criado, 400 se o corpo for inválido    |
| PUT    | /users/:id | 200 com o atualizado, 400 corpo inválido, 404    |
| DELETE | /users/:id | 200 com o usuário removido, 404 se não existir   |

Os status e os formatos são os mesmos do exercício 5 — a refatoração não mexeu
no contrato da API.

## Middleware

`loggerMiddleware` imprime `[timestamp] MÉTODO /url` no terminal e chama
`next()`. Está registrado com `app.use()` antes de tudo, então também registra
rota inexistente e requisição com JSON quebrado, que morrem antes de chegar nas
rotas. O parâmetro `res` entra na assinatura porque o Express sempre passa os
três argumentos nessa ordem: para chegar em `next` eu preciso declarar `res`,
mesmo sem usar (por isso ele está como `_res`).

## Decisões de tipo no UserService

- `getById`, `update` e `delete` devolvem `IUser | undefined`. O `undefined` é o
  jeito natural de dizer "não achei" — quem traduz isso em 404 é a rota, que é
  quem conhece HTTP.
- `delete` devolve o usuário removido em vez de `true/false`, porque o exercício
  5 respondia com o objeto apagado e eu não quis mudar a resposta.
- `create` recebe `Omit<IUser, 'id'>` e não `IUser` como está no enunciado. Quem
  gera o id sequencial é o serviço, então pedir um id que seria ignorado só
  atrapalha quem chama.
- `update` recebe `Partial<IUser>` e faz `{ ...atual, ...alterações, id }`, o que
  permite mandar só o campo que mudou. O `id` é reescrito no final para o id da
  URL não ser trocado pelo corpo.
- `getAll` devolve uma cópia (`[...this.users]`) para ninguém alterar a lista
  interna por fora do serviço.

A validação do corpo continua na rota, com `typeof` em cada campo: TypeScript só
confere tipo em tempo de compilação e o JSON do cliente chega em tempo de
execução, então `req.body as IUser` não garantiria nada.

## Testes

Estão em [docs/testes.md](docs/testes.md), com o corpo e o status de cada chamada
e o log que apareceu no terminal.

## Respondendo as perguntas da entrega

**Qual problema o middleware resolve?** Ele tira do caminho a repetição. Sem
middleware, para saber o que a API está recebendo eu teria que colocar um
`console.log` dentro de cada rota, e ainda assim não veria as chamadas que nem
chegam a bater numa rota. Com um `app.use()` no começo do arquivo, uma função só
enxerga toda requisição que entra, e o dia que eu quiser mudar o formato do log
ou medir o tempo de resposta é um arquivo só para alterar.

**Por que o UserService melhora a organização?** Porque separa duas coisas que
estavam misturadas no `server.ts`: a regra de mexer nos usuários e o protocolo
HTTP. Hoje a rota só converte o `id`, valida o corpo e escolhe o status; quem
sabe onde os usuários moram e como procurar, criar, alterar e remover é o
serviço. Isso deixa o arquivo de rotas curto e o serviço testável sem subir o
Express — ele não importa `Request` nem `Response`. E quando esses dados saírem
da memória para um banco, muda o `UserService` e nenhuma rota precisa ser tocada.
