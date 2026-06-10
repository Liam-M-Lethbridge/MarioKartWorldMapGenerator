import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { assignProbabilities, choose, assignCumProbs } from './probabilities.ts';
import { getData, readProbs, saveProbs, startupProcedure, readVars, saveVars } from './data.ts';
import { request } from 'node:http';
const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/maps', async (req: Request, res) => {
  const probs = await startupProcedure();
  res.json(probs);
});

app.get('/api/generate_map', async (req: Request, res) => {
  const probs = await readProbs();
  const map = await choose(probs);
  saveProbs(probs);
  res.json(map);
});

app.post('/api/generate_set', async (req: Request, res) => {
  const num = (req.body.mapNum);
  const maps = [];
  const probs = await readProbs();

  for(let i = 0; i < num; i++){
    console.log("length", probs.length)
    maps.push(await choose(probs));
  }
  saveProbs(probs);
  res.json(maps);
});

app.post('/api/write_cooldown', async (req: Request, res) => {
  const num = (req.body.cooldown);
  const vars = await readVars();
  saveVars(num, vars["probType"])
  let probs = await readProbs();
  probs = assignProbabilities(probs);
  probs = assignCumProbs(probs);
  res.json(probs);
});

app.get('/api/reset_history', async (req: Request, res) =>{
  let probs = await getData();
  probs = assignProbabilities(probs);
  probs = assignCumProbs(probs);
  saveProbs(probs);

  res.json(probs);
})

app.get('/api/get_cooldown', async (req: Request, res) =>{
  const vars = await readVars();
  res.json(vars["cooldown"]);
})

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});