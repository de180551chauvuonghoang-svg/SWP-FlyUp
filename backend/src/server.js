import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routers/auth.route.js';
import messagesRouter from './routers/messages.route.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
// console.log(process.env.PORT);

app.use('/api/auth', authRouter);
app.use('/api/messages', messagesRouter);

app.listen(PORT, () =>
  console.log('Server is running on port: ' + PORT));
