import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { routes } from './routes'


const app = express();
app.set('host', '0.0.0.0');
app.use(cors());

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/todos/', routes);

export { app as todosExpress };