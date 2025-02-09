import express from 'express';
import auth from '../middleware/Auth';
import { RequestWithUser } from '../types/user';
import { ReplyFields } from '../types/reply';
import Reply from '../models/Reply';
import Post from '../models/Post';
import { Error, Types } from 'mongoose';
import User from '../models/User';
import { toggleItemInArray } from '../utils';

const replyRouter = express.Router();

replyRouter.post('/', auth, async (req: RequestWithUser, res, next) => {
  try {
    const replyData: ReplyFields = {
      image: null,
      text: req.body.text,
      author: req.user._id,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
      toPost: req.body.post ? req.body.post : null,
      toReply: req.body.reply ? req.body.reply : null,
    };

    const reply = new Reply(replyData);
    await reply.save();

    const post = await Post.findByIdAndUpdate(req.body.post);

    if (!post) {
      res.status(404).send({ error: 'Post not found.' });
      return;
    }

    post.replies.push(reply._id);
    await post.save();

    const populatedReply = await Reply.findById(reply.id).populate('author');
    res.send(populatedReply);
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      res.status(422).send({ error: e });
    }
    next(e);
  }
});

replyRouter.post(
  '/likes/:id',
  auth,
  async (req: RequestWithUser, res, next) => {
    try {
      const replyId = req.params.id;

      if (!Types.ObjectId.isValid(replyId.toString())) {
        res.status(422).send({ error: 'Invalid reply.' });
        return;
      }

      const reply = await Reply.findById(replyId);
      const user = await User.findById(req.user._id);

      if (!(reply && user)) {
        res.status(404).send({ error: 'Not Found.' });
        return;
      }

      reply.likes = toggleItemInArray(reply.likes, user.id);
      user.liked_replies = toggleItemInArray(user.liked_replies, reply.id);

      await reply.save();
      await user.save();

      res.send(reply);
    } catch (e) {
      if (e instanceof Error.ValidationError) {
        res.status(422).send({ error: e });
      }
      next(e);
    }
  }
);

replyRouter.delete('/:id', auth, async (req: RequestWithUser, res, next) => {
  try {
    const replyId = req.params.id;

    if (!Types.ObjectId.isValid(replyId.toString())) {
      res.status(422).send({ error: 'Invalid reply.' });
      return;
    }

    const reply = await Reply.findById(replyId).populate('toPost');
    const post = await Post.findById(reply?.toPost);

    if (!(reply && post)) {
      res.status(404).send({ error: 'Reply not found.' });
      return;
    }

    if (
      reply.author._id.toString() !== req.user._id.toString() &&
      reply.toPost.author._id.toString() !== req.user._id.toString()
    ) {
      res.status(403).send({ error: 'Unauthorized.' });
      return;
    }
    post.replies = post.replies.filter(
      (id) => id.toString() !== replyId.toString()
    );
    await post.save();
    await Reply.deleteOne({ _id: replyId });
    res.send({ message: 'Reply deleted successfully.' });
  } catch (e) {
    next(e);
  }
});

export default replyRouter;
