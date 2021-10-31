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
    Bandname: newBand.Bandname,
  });
  if (existingBand) {
    res.status(409).send(`${newBand.Bandname} already exists in the Database!`);
  } else {
    const insertedBand = await getBandCollection().insertOne(newBand);
    res.send(
      `${newBand.Bandname} added to the Database with the id ${insertedBand.insertedId}!`
    );
  }
});

app.get('/api/bands', async (_req, res) => {
  const allBands = await getBandCollection().find().toArray();
  res.send(allBands);
});

app.get('/api/bands/:bandname', async (req, res) => {
  const bandname = req.params.bandname;
  const band = await getBandCollection().findOne({ Bandname: bandname });

  if (band) {
    res.send(band);
  } else {
    res.status(404).send(`Couldn't find band ${bandname}`);
  }
});

app.get('/api/bands/founded/:foundingYear', async (req, res) => {
  const foundingYear = Number(req.params.foundingYear);
  const bands = await getBandCollection()
    .find({ 'founding year': foundingYear })
    .toArray();
  if (bands.length > 0) {
    res.send(bands);
  } else {
    res.status(404).send(`Couldn't find a band founded in ${foundingYear}`);
  }
});

app.get('/api/bands/:bandname/members', async (req, res) => {
  const bandname = req.params.bandname;
  const band = await getBandCollection().findOne({ Bandname: bandname });

  if (band) {
    res.send(band.Members);
  } else {
    res.status(404).send(`Couldn't find band ${bandname}`);
  }
});

app.delete('/api/bands/:bandname', async (req, res) => {
  const bandname = req.params.bandname;
  const deletedBand = await getBandCollection().deleteOne({
    Bandname: bandname,
  });

  if (deletedBand.deletedCount !== 0) {
    res.send(`${bandname} is deleted`);
  } else {
    res.status(404).send(`Couldn't find band ${bandname}`);
  }
});

app.patch('/api/bands/:bandname/Genre', async (req, res) => {
  const bandname = req.params.bandname;
  const newGenre = req.body.Genre;
  const updatedBand = await getBandCollection().updateOne(
    { Bandname: bandname },
    { $push: { Genre: newGenre } }
  );

  if (updatedBand.modifiedCount !== 0) {
    res.send(`Genre of ${bandname} was expanded to include ${newGenre}`);
  } else {
    res.send('Nothing was modified');
  }
});

connectDatabase(process.env.MONGODB_URL).then(() => {
  app.listen(port, () => {
    console.log('Is fertichhh');
  });
});
