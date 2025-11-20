import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routers/auth.route.js';
import messagesRouter from './routers/messages.route.js';
import path from "path";
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

const __dirname = path.resolve();


const PORT = ENV.PORT || 3000;

app.use(express.json()); //req.body
app.use(cookieParser());
// console.log(ENV.PORT);

app.use('/api/auth', authRouter);
app.use('/api/messages', messagesRouter);

app.get('/', (_, res) => {
  res.status(200).json({ message: 'Server is running' });
});

//make ready for deployment

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")))

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
  })
}

app.listen(PORT, () => {
  console.log(`Server is running on port: ` + PORT);

  connectDB();


});
