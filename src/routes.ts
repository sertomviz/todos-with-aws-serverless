import { Router } from 'express';
import { check } from 'express-validator';
import {signin, signup, getTodos, getTodo, createTodo} from './controllers';

const routes = Router();

routes.post('/signin', [], signin);
routes.post('/signup', [], signup);
routes.post('/list', [], getTodos);
routes.post('/get', [], getTodo);
routes.post('/create', [check('todo', 'Todo is required').notEmpty()], createTodo);

export { routes };