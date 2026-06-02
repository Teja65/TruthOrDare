import dotenv from 'dotenv';
import app from './app';
import { connectMongo } from './config/db';
import { initializeFirebase } from './config/firebase';

dotenv.config();

initializeFirebase();

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

connectMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`TruthOrDare backend listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
