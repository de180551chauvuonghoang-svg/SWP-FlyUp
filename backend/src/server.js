import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routers/auth.route.js';
import messagesRouter from './routers/messages.route.js';
import path from "path";

dotenv.config();

const app = express();

const __dirname = path.resolve();


const PORT = process.env.PORT || 3000;
// console.log(process.env.PORT);

app.use('/api/auth', authRouter);
app.use('/api/messages', messagesRouter);


//make ready for deployment

if (process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("*", (_, res) => {
      res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
    })
}

app.listen(PORT, () =>
  console.log('Server is running on port: ' + PORT));
