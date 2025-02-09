import express from 'express';
import cors from 'cors';
import config from './config';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import usersRouter from './routes/users';
import postsRouter from './routes/posts';
import replyRouter from './routes/replies';

const app = express();
const localhost = `http://localhost:${config.port}`;

app.use(
  cors({
    origin: config.IpWhiteList,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/replies', replyRouter);

const run = async () => {
  await mongoose.connect(config.mongoose.db);

  app.listen(config.port, () => {
    console.log(`Server running at ${localhost}`);
    console.log(config.IpWhiteList)
  });

  process.on('exit', () => {
    mongoose.disconnect();
  });
};

void run();
