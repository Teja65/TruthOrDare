import dotenv from 'dotenv';
import app from './app';
import { connectMongo } from './config/db';
import { initializeFirebase } from './config/firebase';
import translations from './en.json';

dotenv.config();

initializeFirebase();

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

connectMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`${translations.messages.serverStarted} http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
