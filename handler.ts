import awsServerlessExpress from 'aws-serverless-express';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { todosExpress } from './src/todos-express';

export const todos = (event: APIGatewayProxyEvent, context: Context) => {
  const server = awsServerlessExpress.createServer(todosExpress);
  return awsServerlessExpress.proxy(server, event, context);
};


