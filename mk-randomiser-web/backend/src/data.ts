import fs from 'fs';
import csv from 'csv-parser';
import { assignCumProbs, assignProbabilities } from './probabilities.ts';

export function getData(): Promise<any[]> {
    return new Promise((resolve, reject) => {

        const results: any[] = [];

        fs.createReadStream('./data/maps.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                if (typeof Storage !== 'undefined') {
                    sessionStorage.setItem('probs', JSON.stringify(results));
                }

                resolve(results);
            })
            .on('error', reject);
    });
}

export function readVars(){
    return new Promise((resolve, reject) => {
        let vars: any[] = [];
        fs.readFile("../data/vars.json", (error, data) => {
        if (error) {
            console.error(error);
            throw error;
            }
            vars = JSON.parse(data);
        })
        resolve(vars)
    })
}

export function saveProbs(table: any){
    const jsonTable = JSON.stringify(table);
    fs.writeFile("./data/probs.json", jsonTable, (error) => {
    if (error) {
        // logging the error
        console.error(error);
        
        throw error;
    }

  console.log("data.json written correctly");
});
}

export async function readProbs(): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let probs: any[] = [];
        fs.readFile("./data/probs.json", (error, data) => {
        if (error) {
            console.error(error);
            throw error;
            }
            probs = JSON.parse(data);
        })
        resolve(probs)
    })
}

export async function startupProcedure(){
    let probs: any[] = [];
    if(fs.existsSync("../data/probs.json")){
        probs = await readProbs();
    }
    else{
        probs = await getData();
        probs = assignProbabilities(probs);
        probs = assignCumProbs(probs);
        await saveProbs(probs);
    }
    return probs;
}