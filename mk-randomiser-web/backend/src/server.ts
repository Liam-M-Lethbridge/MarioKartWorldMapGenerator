import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { assignProbabilities, choose, assignCumProbs } from './probabilities.ts';
import { getData, readProbs, saveProbs, startupProcedure } from './data.ts';
const app = express();
app.use(cors());

app.get('/api/maps', async (req: Request, res) => {
  const probs = await startupProcedure();
  res.json(probs);
});

app.get('/api/generate_map', async (req: Request, res) => {
  const probs = await readProbs();
  const map = await choose(probs);
  saveProbs(probs);

  res.json(map)
});

app.get('/api/reset_history', async (req: Request, res) =>{
  let probs = await getData();
  probs = assignProbabilities(probs);
  probs = assignCumProbs(probs);
  saveProbs(probs);

  res.json(probs);
})

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});