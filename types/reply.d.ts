export interface ReplyFields {
  image: string | null;
  text: string;
  author: ObjectId;
  createdAt: string;
  likes: ObjectId[];
  replies: ObjectId[];
  toPost: ObjectId;
  toReply: ObjectId;
}
