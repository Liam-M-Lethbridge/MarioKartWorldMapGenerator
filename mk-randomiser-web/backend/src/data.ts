import fs from 'fs';
import csv from 'csv-parser';
import { assignCumProbs, assignProbabilities } from './probabilities.ts';

// Function reads and returns the map names from maps.csv
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

// Function reads and returns the variables data from vars.json
export function readVars(): Promise<any[]>{
    return new Promise((resolve, reject) => {
        fs.readFile("./data/vars.json", "utf-8", (error, data) => {

            if (error) {
                reject(error);
                return;
            }

            // if the file is empty
            if (!data.trim()) {
                resolve([]);
            }

            try {
                const probs = JSON.parse(data);
                resolve(probs);
            } catch (err) {
                reject(err);
            }
        });
    });
}

// Function saves the vars data passed to it to vars.json
export function saveVars(cooldown:number, probType: string){
    const data = JSON.stringify({
        'cooldown':cooldown,
        'probType': probType
    })
    fs.writeFile("./data/vars.json", data, (error) => {
        if (error) {
            // logging the error
            console.error(error);
            
            throw error;
        }
    });
}

// Function saves the map probability data passed to it to probs.json
export function saveProbs(table: any){
    const jsonTable = JSON.stringify(table);
    fs.writeFile("./data/probs.json", jsonTable, (error) => {
    if (error) {
        // logging the error
        console.error(error);
        
        throw error;
    }

    });
}

// Function reads the probability data from probs.json
export async function readProbs(): Promise<any[]> {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/probs.json", "utf-8", (error, data) => {

            if (error) {
                reject(error);
                return;
            }

            // if the file is empty
            if (!data.trim()) {
                resolve([]);
            }


            try {
                const probs = JSON.parse(data);
                resolve(probs);
            } catch (err) {
                reject(err);
            }
        });
    });
}

// Function called when client is mounted. Reads probability data if it exists. Otherwise it makes it. Same for vars data.
export async function startupProcedure(){
    var probs: any[] = [];
    if(fs.existsSync("./data/probs.json")){
        probs = await readProbs();
    }
    else{
        probs = await getData();
        probs = assignProbabilities(probs);
        probs = assignCumProbs(probs);
        await saveProbs(probs);
    }
    if(probs.length == 0){
        probs = await getData();
        probs = assignProbabilities(probs);
        probs = assignCumProbs(probs);
        await saveProbs(probs);
    }

    if(! fs.existsSync("./data/vars.json")){
        saveVars(6, 'linear')
    }else{
        if((await readVars()).length == 0){
            saveVars(6, 'linear')
        }
    }

    return probs;
}