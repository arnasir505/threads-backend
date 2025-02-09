import { model, Schema, Types } from 'mongoose';
import { ReplyFields } from '../types/reply';
import User from './User';

interface ReplyDocument extends Document, ReplyFields {}

const ReplySchema = new Schema<ReplyDocument>(
  {
    image: String || null,
    text: {
      type: String,
      required: [true, 'Please enter reply'],
      trim: true,
    },
    author: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: async (id: Types.ObjectId) => await User.findById(id),
        message: 'User does not exist.',
      },
    },
    createdAt: {
      type: String,
      required: true,
      trim: true,
    },
    likes: [{ type: Types.ObjectId, ref: 'User' }],
    replies: [{ type: Types.ObjectId, ref: 'Reply' }],
    toPost: {
      type: Types.ObjectId || null,
      ref: 'Post',
    },
    toReply: {
      type: Types.ObjectId || null,
      ref: 'Reply',
    },
  },
  { versionKey: false }
);

const Reply = model<ReplyDocument>('Reply', ReplySchema);

export default Reply;
