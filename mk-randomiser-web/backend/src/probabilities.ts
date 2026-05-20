import { readVars } from "./data.ts";
export function assignProbabilities(probs: any[]) {
    probs.forEach((element) => {
        element.prob = 1;
        element.since_last_played = 30;
    });

    return probs;
}

export function assignCumProbs(probs: any[]){
    let cum = 0;
    probs.forEach(element => {
        cum += element["prob"];
        element["cumulative_probs"] = cum;
    });
    return probs;
}

export function calcProbabilities(probs: any[], cooldown: number, probType:string){
    probs.forEach(element => {
        if (element["since_last_played"] < cooldown){
            element["prob"] = 0;
        }else if(element["since_last_played"] < cooldown*2){

            // if linear rejoining
            if (probType == "linear"){
                element["prob"] = (element["since_last_played"]-cooldown)/cooldown;
            }
            // if exponential rejoining
            else if (probType == "exponential"){
                element["prob"] = Math.pow(2, element["since_last_played"]-(cooldown*2));
            }
            else{
                console.error("Invalid value for probType argument");
            }
        };
    });
    probs = assignCumProbs(probs);
}

export function choose(probs: any[]){
    const max_prob = probs[-1]["cumulative_probs"];
    const n = Math.random()*max_prob;
    let index = 0;
    probs.forEach(element => {
        if (n > element["cumulative_probs"]){
            index +=1;
        }else{
            const vars = readVars()
            
            probs = update_table(probs, index);
            return index;
        }
    });
}

function update_table(probs: any[], index: number){
    probs.forEach(element => {
        if (element["since_last_played"] < 30){
        element["since_last_played"] +=1
        }
    });
    probs[index]["since_last_played"] = 0;

    calcProbabilities()
    return probs;
}
