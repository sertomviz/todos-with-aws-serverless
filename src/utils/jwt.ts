
import { Request } from 'express';
import axios from 'axios';
import jwkToPem from 'jwk-to-pem';
import { Secret } from 'jsonwebtoken';

export const getJWTPublicKey = async () => {
  const url = `https://cognito-idp.eu-west-1.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
  try {
    const jwks = await axios.get(url);
    const jwk = jwks.data.keys[0];
    const pem: Secret = jwkToPem(jwk);
    return pem;
    //return token.replace(/\\n/g, '\n');
  } catch(err) {
    return null;
  }
}

export const getTokenFromRequest = (req: Request) => (req.header('Authorization') || '').replace('Bearer ', '');
