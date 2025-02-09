import { Schema, Types, model, Document } from 'mongoose';
import User from './User';
import { PostFields } from '../types/post';

interface PostDocument extends Document, PostFields {}

const PostSchema = new Schema<PostDocument>(
  {
    image: String || null,
    text: {
      type: String,
      required: [true, 'Please enter text'],
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
  },
  { versionKey: false }
);

const Post = model<PostDocument>('Post', PostSchema);

export default Post;
