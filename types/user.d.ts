import { JwtPayload } from 'jsonwebtoken';
import { HydratedDocument, Schema } from 'mongoose';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: HydratedDocument<UserFromDb>;
}

export interface UserFields {
  alatooID: number;
  name: string;
  password: string;
  avatar: string | null;
  role: string;
  liked_posts: ObjectId[];
  liked_replies: ObjectId[];
  followers: Schema.Types.ObjectId[];
  following: Schema.Types.ObjectId[];
}

export interface UserFromDb {
  _id: ObjectId;
  alatooID: number;
  name: string;
  avatar: string | null;
  role: string;
  liked_posts: ObjectId[];
  liked_replies: ObjectId[];
  followers: Schema.Types.ObjectId[];
  following: Schema.Types.ObjectId[];
}

export interface DecodedJwt extends JwtPayload {
  user?: string;
}
