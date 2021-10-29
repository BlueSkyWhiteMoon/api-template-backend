import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDatabase, getBandCollection } from './utils/database';
//import cookieParser from 'cookie-parser';

if (!process.env.MONGODB_URL) {
  throw new Error("Couldn't connect to the database");
}

const app = express();
const port = 3000;

app.use(express.json());

//create update read delete
app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.post('/api/bands', async (req, res) => {
  const newBand = req.body;
  const existingBand = await getBandCollection().findOne({
    name: newBand.name,
  });
  if (existingBand) {
    res.status(409).send(`${newBand.name} already exists in the Database!`);
  } else {
    const insertedBand = await getBandCollection().insertOne(newBand);
    res.send(
      `${newBand.name} added to the Database with the id ${insertedBand.insertedId}!`
    );
  }
});

app.connectDatabase(process.env.MONGODB_URL).then(() => {
  app.listen(port, () => {
    console.log('Is fertichhh');
  });
});
