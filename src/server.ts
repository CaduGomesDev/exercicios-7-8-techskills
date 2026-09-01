import express, { Request, Response } from 'express';
import { IUser } from './models/user';

interface IError {
  message: string;
}

interface IParams {
  id: string;
}

const app = express();
const PORT = 3000;

app.use(express.json());

let users: IUser[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', isActive: true },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', isActive: false },
];

function isValidUser(body: unknown): body is Omit<IUser, 'id'> {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const data = body as Partial<IUser>;

  return (
    typeof data.name === 'string' &&
    typeof data.email === 'string' &&
    typeof data.isActive === 'boolean'
  );
}

app.get('/users', (_req: Request, res: Response<IUser[]>) => {
  res.json(users);
});

app.get('/users/:id', (req: Request<IParams>, res: Response<IUser | IError>) => {
  const id = Number(req.params.id);
  const user = users.find((user) => user.id === id);

  if (!user) {
    res.status(404).json({ message: 'Usuário não encontrado' });
    return;
  }

  res.json(user);
});

app.post('/users', (req: Request<object, IUser | IError, unknown>, res: Response<IUser | IError>) => {
  if (!isValidUser(req.body)) {
    res.status(400).json({
      message: 'Dados inválidos. Envie: { name: string, email: string, isActive: boolean }',
    });
    return;
  }

  const nextId = users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;
  const newUser: IUser = {
    id: nextId,
    name: req.body.name,
    email: req.body.email,
    isActive: req.body.isActive,
  };

  users.push(newUser);

  res.status(201).json(newUser);
});

app.put('/users/:id', (req: Request<IParams, IUser | IError, unknown>, res: Response<IUser | IError>) => {
  const id = Number(req.params.id);

  if (!isValidUser(req.body)) {
    res.status(400).json({
      message: 'Dados inválidos. Envie: { name: string, email: string, isActive: boolean }',
    });
    return;
  }

  const index = users.findIndex((user) => user.id === id);

  if (index === -1) {
    res.status(404).json({ message: 'Usuário não encontrado' });
    return;
  }

  const updatedUser: IUser = {
    id,
    name: req.body.name,
    email: req.body.email,
    isActive: req.body.isActive,
  };

  users[index] = updatedUser;

  res.json(updatedUser);
});

app.delete('/users/:id', (req: Request<IParams>, res: Response<IUser | IError>) => {
  const id = Number(req.params.id);
  const user = users.find((user) => user.id === id);

  if (!user) {
    res.status(404).json({ message: 'Usuário não encontrado' });
    return;
  }

  users = users.filter((user) => user.id !== id);

  res.json(user);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
