export interface PostFields {
  image: string | null;
  text: string;
  author: ObjectId;
  createdAt: string;
  likes: ObjectId[];
  replies: ObjectId[];
}
