import express from 'express';
import Post from '../models/Post';
import auth from '../middleware/Auth';
import { RequestWithUser } from '../types/user';
import { PostFields } from '../types/post';
import { Types, Error } from 'mongoose';
import User from '../models/User';
import { toggleItemInArray } from '../utils';

const postsRouter = express.Router();

postsRouter.post('/', auth, async (req: RequestWithUser, res, next) => {
  try {
    const postData: PostFields = {
      text: req.body.text,
      image: null,
      author: req.user._id,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
    };

    const post = new Post(postData);
    await post.save();

    const populatedPost = await Post.findById(post.id).populate('author');

    res.send(populatedPost);
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      res.status(422).send({ error: e });
    }
    next(e);
  }
});

postsRouter.post(
  '/likes/:id',
  auth,
  async (req: RequestWithUser, res, next) => {
    try {
      const postId = req.params.id;

      if (!Types.ObjectId.isValid(postId.toString())) {
        res.status(422).send({ error: 'Invalid post.' });
        return;
      }

      const post = await Post.findById(postId);
      const user = await User.findById(req.user._id);

      if (!(post && user)) {
        res.status(404).send({ error: 'Not Found.' });
        return;
      }

      post.likes = toggleItemInArray(post.likes, user.id);
      user.liked_posts = toggleItemInArray(user.liked_posts, post.id);

      await post.save();
      await user.save();

      res.send(post);
    } catch (e) {
      if (e instanceof Error.ValidationError) {
        res.status(422).send({ error: e });
      }
      next(e);
    }
  }
);

postsRouter.get('/feed', auth, async (req: RequestWithUser, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      res.status(404).send({ error: 'User not found' });
      return;
    }

    const posts = await Post.find({
      author: { $in: currentUser.following },
    })
      .sort('-createdAt')
      .populate('author', '-liked_posts -liked_replies');

    res.send(posts);
  } catch (e) {
    next(e);
  }
});

postsRouter.get('/:id', auth, async (req, res, next) => {
  try {
    const postId = req.params.id;

    if (!Types.ObjectId.isValid(postId.toString())) {
      res.status(422).send({ error: 'Invalid post.' });
      return;
    }

    const post = await Post.findById(postId)
      .populate('author', '-liked_posts -liked_replies')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: '-liked_posts -liked_replies' },
      });

    if (!post) {
      res.status(404).send({ error: 'Not Found.' });
      return;
    }
    res.send(post);
  } catch (e) {
    next(e);
  }
});

postsRouter.get('/', auth, async (_req, res, next) => {
  try {
    const posts = await Post.find()
      .sort('-createdAt')
      .populate('author', '-liked_posts -liked_replies');
    res.send(posts);
  } catch (error) {
    next(error);
  }
});

postsRouter.delete('/:id', auth, async (req: RequestWithUser, res, next) => {
  try {
    const postId = req.params.id;

    if (!Types.ObjectId.isValid(postId.toString())) {
      res.status(422).send({ error: 'Invalid post.' });
      return;
    }

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).send({ error: 'Post not found.' });
      return;
    }

    if (post.author._id.toString() !== req.user._id.toString()) {
      res.status(403).send({ error: 'Unauthorized.' });
      return;
    }

    await Post.deleteOne({ _id: postId });
    res.send({ message: 'Post deleted successfully.' });
  } catch (e) {
    next(e);
  }
});

export default postsRouter;
