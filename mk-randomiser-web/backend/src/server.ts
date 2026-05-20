import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { assignProbabilities, choose } from './probabilities.ts';
import { getData, startupProcedure } from './data.ts';
const app = express();
app.use(cors());

app.get('/api/maps', async (req: Request, res) => {
  const probs = await startupProcedure();
  console.log(probs);
  res.json(probs);
});

app.get('/api/generate_map', (req: Request, res) => {

  const map = choose()

  res.json(map)
});

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});