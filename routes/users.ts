import express, { NextFunction, Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import config from '../config';
import { Error } from 'mongoose';
import { configDotenv } from 'dotenv';
import { RequestWithUser } from '../types/user';
import VerifyRefreshToken from '../middleware/VerifyRefreshToken';
import auth from '../middleware/Auth';
import Post from '../models/Post';

configDotenv();

const usersRouter = express.Router();

usersRouter.post('/sessions', userLogin);
usersRouter.get('/refresh', VerifyRefreshToken, userRefreshToken);
usersRouter.delete('/logout', userLogout);
usersRouter.post('/follow', auth, followUser);
usersRouter.post('/unfollow', auth, unfollowUser);
usersRouter.get('/search', auth, searchUsers);
usersRouter.get('/:id', auth, getUser);

async function userLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { alatooID, password } = req.body;
    const user = await User.findOne({ alatooID });

    if (!user) {
      res.status(401).send({
        error: 'Incorrect Alatoo ID or password',
      });
      return;
    }

    const isMatch = await user.checkPassword(password);

    if (!isMatch) {
      res.status(401).send({
        error: 'Incorrect Alatoo ID or password',
      });
      return;
    }

    const accessToken = jwt.sign(
      { user: user._id },
      `${process.env.JWT_ACCESS}`,
      {
        expiresIn: `${config.JwtAccessExpiresAt}s`,
      }
    );

    const refreshToken = jwt.sign(
      { user: user._id },
      `${process.env.JWT_REFRESH}`,
      {
        expiresIn: `${config.JwtRefreshExpiresAt}ms`,
      }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: config.JwtRefreshExpiresAt,
    });

    res.send({ accessToken, user });
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      res.status(422).send({ error: e });
    }

    next(e);
  }
}

async function userRefreshToken(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await User.findById(req.user._id);

    const accessToken = jwt.sign(
      { user: req.user?._id },
      `${process.env.JWT_ACCESS}`,
      {
        expiresIn: `${config.JwtAccessExpiresAt}s`,
      }
    );
    const refreshToken = jwt.sign(
      { user: req.user?._id },
      `${process.env.JWT_REFRESH}`,
      {
        expiresIn: `${config.JwtRefreshExpiresAt}s`,
      }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: config.JwtRefreshExpiresAt,
    });

    res.send({ accessToken, user });
  } catch (e) {
    next(e);
  }
}

async function followUser(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = req.body;
    const currentUser = await User.findById(req.user._id);
    const userToFollow = await User.findById(userId);

    if (!userToFollow || !currentUser) {
      res.status(404).send({ error: 'User not found' });
      return;
    }

    if (currentUser.following.includes(userId)) {
      res.status(400).send({ error: 'Already following this user' });
      return;
    }

    currentUser.following.push(userId);
    userToFollow.followers.push(currentUser.id);

    await currentUser.save();
    await userToFollow.save();

    res.send({ message: 'Successfully followed user' });
  } catch (e) {
    next(e);
  }
}

async function unfollowUser(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = req.body;
    const currentUser = await User.findById(req.user.id);
    const userToUnfollow = await User.findById(userId);

    if (!userToUnfollow || !currentUser) {
      res.status(404).send({ error: 'User not found' });
      return;
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user.id
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.send({ message: 'Successfully unfollowed user' });
  } catch (e) {
    next(e);
  }
}

async function searchUsers(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      res.status(400).send({ message: 'Query parameter is required' });
      return;
    }

    const users = await User.find({
      name: { $regex: query, $options: 'i' },
    }).select('name avatar _id alatooID');

    res.send(users);
  } catch (e) {
    next(e);
  }
}

async function getUser(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;

    const user = await User.findOne({ alatooID: id });

    if (!user) {
      res.status(404).send({ error: 'User not found.' });
      return;
    }

    const posts = await Post.find({ author: user._id })
      .sort('-createdAt')
      .populate('author', '-liked_posts -liked_replies');

    res.send({ user, posts });
  } catch (e) {
    next(e);
  }
}

function userLogout(_req: Request, res: Response, next: NextFunction) {
  try {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      maxAge: 0,
    });

    res.send('Refresh token cleared!');
  } catch (e) {
    next(e);
  }
}

export default usersRouter;
