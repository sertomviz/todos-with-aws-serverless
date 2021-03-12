import { Request, Response } from 'express';
import aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import jwt, { Secret, VerifyErrors}  from 'jsonwebtoken';
import { getJWTPublicKey, getTokenFromRequest } from './utils/jwt';

export const signin = async (req: Request, res: Response) => {
  const {username, password } = req.body;
  const cognito = new aws.CognitoIdentityServiceProvider();

  return cognito.initiateAuth({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: process.env.COGNITO_CLIENT_ID || '',
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password
    }
  }, (err, data) => {
    if (err) { 
      return res.status(500).send(err);
    } else {
      return res.status(200).send(data.AuthenticationResult);
    }
  });
};

export const signup = async (req: Request, res: Response) => {
  const {username, password } = req.body;
  const cognito = new aws.CognitoIdentityServiceProvider();

  return cognito.signUp({
    Username: username,
    Password: password,
    ClientId: process.env.COGNITO_CLIENT_ID || ''
  }, (err, data) => {
    if (err) { 
      return res.status(500).send(err);
    } else {
      return res.status(200).send({
        id: data.UserSub, 
        message: 'Please check your email to verify your account'
      });
    }
  });
};

interface PartialJWT {
  sub: string;
  email: string;
}

export const createTodo = async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  const publicKey = await getJWTPublicKey() as Secret;

  return jwt.verify(token, publicKey, async (err: VerifyErrors, verifiedJwt: PartialJWT) => {
    if (err) {
      return res.status(400).send({ error: 'token not verified' });
    } else {
      const docClient = new aws.DynamoDB.DocumentClient();
      const { todo } = req.body;
      const user_id = verifiedJwt['sub'];
      const timestamp = new Date().getTime();
      const params = {
        TableName: process.env.DYNAMODB_TABLE || '',
        Item: {
          userId: user_id,
          todoId: uuidv4(),
          text: todo,
          checked: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
      }
      
      return docClient.put(params, (err, data) => {
        if (err) {
          return res.status(500).send(err);
        } else {
          return res.status(200).send(data.Attributes);
        }
      });
    }
  });
};

export const getTodos = async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  const publicKey = await getJWTPublicKey() as Secret;

  return jwt.verify(token, publicKey, async (err: VerifyErrors, verifiedJwt: PartialJWT) => {
    if (err) {
      return res.status(400).send({ error: 'token not verified' });
    } else {
      const docClient = new aws.DynamoDB.DocumentClient();
      const userId = verifiedJwt['sub'];
      const params = {
        TableName: process.env.DYNAMODB_TABLE || '',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      };
      
      return docClient.query(params, (err, data) => {
        if (err) {
          return res.status(500).send(err);
        } else {
          return res.status(200).send(data.Items);
        }
      });
    }
  });
};

export const getTodo = async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  const publicKey = await getJWTPublicKey() as Secret;

  return jwt.verify(token, publicKey, async (err: VerifyErrors, verifiedJwt: PartialJWT) => {
    if (err) {
      return res.status(400).send({ error: 'token not verified' });
    } else {
      const docClient = new aws.DynamoDB.DocumentClient();
      const userId = verifiedJwt['sub'];
      const { todoId } = req.body;
      const params = {
        TableName: process.env.DYNAMODB_TABLE || '',
        Key: {
          userId,
          todoId
        }
      };
      
      return docClient.get(params, (err, data) => {
        if (err) {
          return res.status(500).send(err);
        } else {
          return res.status(200).send(data.Item);
        }
      });
    }
  });
};