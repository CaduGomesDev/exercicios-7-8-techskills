import express, { Request, Response } from 'express';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { UserService } from './services/user.service';
import { IUser } from './models/user';

interface IError {
  message: string;
}

interface IParams {
  id: string;
}

const app = express();
const PORT = 3000;
const userService = new UserService();

app.use(loggerMiddleware);
app.use(express.json());

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

function isValidUserUpdate(body: unknown): body is Partial<IUser> {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const data = body as Partial<IUser>;

  if (data.name !== undefined && typeof data.name !== 'string') {
    return false;
  }

  if (data.email !== undefined && typeof data.email !== 'string') {
    return false;
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    return false;
  }

  return data.name !== undefined || data.email !== undefined || data.isActive !== undefined;
}

app.get('/users', (_req: Request, res: Response<IUser[]>) => {
  res.json(userService.getAll());
});

app.get('/users/:id', (req: Request<IParams>, res: Response<IUser | IError>) => {
  const id = Number(req.params.id);
  const user = userService.getById(id);

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

  const user = userService.create(req.body);

  res.status(201).json(user);
});

app.put('/users/:id', (req: Request<IParams, IUser | IError, unknown>, res: Response<IUser | IError>) => {
  const id = Number(req.params.id);

  if (!isValidUserUpdate(req.body)) {
    res.status(400).json({
      message: 'Dados inválidos. Envie ao menos um campo entre name (string), email (string) e isActive (boolean)',
    });
    return;
  }

  const user = userService.update(id, req.body);

  if (!user) {
    res.status(404).json({ message: 'Usuário não encontrado' });
    return;
  }

  res.json(user);
});

app.delete('/users/:id', (req: Request<IParams>, res: Response<IUser | IError>) => {
  const id = Number(req.params.id);
  const removed = userService.delete(id);

  if (!removed) {
    res.status(404).json({ message: 'Usuário não encontrado' });
    return;
  }

  res.json(removed);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
