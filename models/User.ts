import { Schema, model, Model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserFields } from '../types/user';

const SALT_WORK_FACTOR = 10;

interface UserMethods {
  checkPassword(password: string): Promise<boolean>;
}

interface UserDocument extends Document, UserFields, UserMethods {}

type UserModel = Model<UserDocument>;

const UserSchema = new Schema<UserDocument>(
  {
    alatooID: {
      type: Number,
      required: [true, 'Alatoo ID is required.'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required.'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      validate: {
        validator: function (password: string) {
          return password.length >= 5;
        },
        message: 'Your password must be at least 5 characters.',
      },
    },
    avatar: String || null,
    role: {
      type: String,
      required: true,
      enum: ['student', 'teacher'],
      default: 'student',
    },
    liked_posts: [{ type: Types.ObjectId, ref: 'Post' }],
    liked_replies: [{ type: Types.ObjectId, ref: 'Reply' }],
    followers: [{ type: Types.ObjectId, ref: 'User' }],
    following: [{ type: Types.ObjectId, ref: 'User' }],
  },
  { versionKey: false }
);

UserSchema.methods.checkPassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = model<UserDocument, UserModel>('User', UserSchema);

export default User;
