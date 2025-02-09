import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { DecodedJwt, RequestWithUser } from '../types/user';

const verifyRefreshToken = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).send({ error: 'Update refresh token' });
    return;
  }

  let decoded: DecodedJwt;
  try {
    decoded = jwt.verify(
      refreshToken,
      `${process.env.JWT_REFRESH}`
    ) as DecodedJwt;
  } catch (e) {
    res.status(401).send({ error: 'Update refresh token' });
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

export default verifyRefreshToken;
