import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { DecodedJwt, RequestWithUser } from '../types/user';

const auth = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const tokenData = req.get('Authorization');

  if (!tokenData) {
    res.status(401).send({ error: 'No token provided' });
    return;
  }

  const [, token] = tokenData.split(' ');
  let decoded: DecodedJwt;
  
  try {
    decoded = jwt.verify(token, `${process.env.JWT_ACCESS}`) as DecodedJwt;
  } catch (e) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }

  const user = await User.findOne({ _id: decoded.user });

  if (!user) {
    res.status(403).send({ error: 'Wrong token' });
    return;
  }

  req.user = user;
  next();
};

export default auth;
