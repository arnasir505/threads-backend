import mongoose from 'mongoose';
import config from './config';
import User from './models/User';
import Post from './models/Post';
import Reply from './models/Reply';

const dropCollection = async (
  db: mongoose.Connection,
  collectionName: string
) => {
  try {
    await db.dropCollection(collectionName);
  } catch (e) {
    console.log(`Collection ${collectionName} was missing, skipping drop....`);
  }
};

const collections = ['users', 'posts', 'replies'];

const run = async () => {
  await mongoose.connect(config.mongoose.db);
  const db = mongoose.connection;

  for (const collection of collections) {
    await dropCollection(db, collection);
  }

  const [user1, user2, user3, user4, user5] = await User.create(
    {
      alatooID: 208715045,
      name: 'Aibika Sabyrkulova',
      password: '12345',
      avatar:
        'https://i.pinimg.com/736x/6f/0c/7d/6f0c7dd236a49fef3d2c7ad9def7f87c.jpg',
      role: 'student',
      liked_posts: [],
      liked_replies: [],
      following: [],
      followers: [],
    },
    {
      alatooID: 208715046,
      name: 'Sultan Dzholdoshbaev',
      password: '12345',
      avatar: null,
      role: 'student',
      liked_posts: [],
      liked_replies: [],
      following: [],
      followers: [],
    },
    {
      alatooID: 208715047,
      name: 'Sadyr Japarov',
      password: '12345',
      avatar:
        'https://i.pinimg.com/736x/5e/5c/21/5e5c21722209fd7f04fae339a2e830f1.jpg',
      role: 'teacher',
      liked_posts: [],
      liked_replies: [],
      following: [],
      followers: [],
    },
    {
      alatooID: 208715048,
      name: 'Kyzzhibek Kanybekova',
      password: '12345',
      avatar:
        'https://i.pinimg.com/736x/06/22/c7/0622c7b35454a3916004f7f3b56e52ad.jpg',
      role: 'student',
      liked_posts: [],
      liked_replies: [],
      following: [],
      followers: [],
    },
    {
      alatooID: 208715049,
      name: 'Ivan ivanov',
      password: '12345',
      avatar:
        'https://i.pinimg.com/736x/bc/72/08/bc72080d9d0a704105afe08586dfa010.jpg',
      role: 'student',
      liked_posts: [],
      liked_replies: [],
      following: [],
      followers: [],
    }
  );

  const [post1, post2, post3] = await Post.create(
    {
      image:
        'https://i.pinimg.com/736x/20/60/85/206085b0387bdab4900a7f6f48766fe6.jpg',
      text: 'Каждый раз говоришь себе: "В этот раз начну заранее!"... И каждый раз работаешь до 3 ночи за день до сдачи. 😅 Как выглядит эта ночь? Запасы кофе, мешки под глазами и Wi-Fi, который предательски тупит.',
      author: user1._id,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
    },
    {
      image: null,
      text: 'Коплю на Porsche 911 Turbo S 🏎️ день первый',
      author: user2._id,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
    },
    {
      image: null,
      text: 'Это, конечно, неправильно, потому что, когда я езжу по Европе, они говорят одно, но делают другое. Сами тоже. Есть европейские страны, которые входят в НАТО или Европейский союз, они же сотрудничают с Россией. А нам они не должны или говорить, указывать или просить, чтобы мы не сотрудничали с Россией или с СНГ',
      author: user3._id,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
    },
    {
      image: null,
      text: "Many of you liked my content and I'm thankful! Follow for more! ^^",
      author: user4._id,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
    },
    {
      image: null,
      text: "Каждый раз обещаешь себе: 'В этот раз всё сделаю заранее!'... И каждый раз в итоге кодишь до рассвета, упиваясь литрами кофе, с глазами красными, как у совы. А Wi-Fi, конечно же, решает, что самое время устроить забастовку. 😅",
      author: user5._id,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
    }
  );

  const [reply1, reply2] = await Reply.create(
    {
      image: null,
      text: 'у меня каждый день проходит именно так',
      author: user2._id,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
      toPost: post1._id,
      toReply: null,
    },
    {
      image: null,
      text: 'Удачи, надеюсь у тебя получится',
      author: user1._id,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
      toPost: post2._id,
      toReply: null,
    }
  );

  await Post.findByIdAndUpdate(post1._id, { $push: { replies: reply1._id } });
  await Post.findByIdAndUpdate(post2._id, { $push: { replies: reply2._id } });

  // await User.findByIdAndUpdate(user1._id, {
  //   $push: { liked_posts: post2._id },
  // });
  // await Post.findByIdAndUpdate(post2._id, {
  //   $push: { likes: user1._id },
  // });

  // await User.findByIdAndUpdate(user2._id, {
  //   $push: { liked_posts: post1._id },
  // });
  // await Post.findByIdAndUpdate(post1._id, {
  //   $push: { likes: user2._id },
  // });

  // await User.findByIdAndUpdate(user2._id, {
  //   $push: { liked_replies: reply2._id },
  // });
  // await Reply.findByIdAndUpdate(reply2._id, {
  //   $push: { likes: user2._id },
  // });

  // await User.findByIdAndUpdate(user2._id, {
  //   $push: { liked_replies: reply1._id },
  // });
  // await Reply.findByIdAndUpdate(reply1._id, {
  //   $push: { likes: user2._id },
  // });

  // await User.findByIdAndUpdate(user1._id, {
  //   $push: { following: user2._id },
  // });
  // await User.findByIdAndUpdate(user2._id, {
  //   $push: { followers: user1._id },
  // });

  await db.close();
};

void run();
