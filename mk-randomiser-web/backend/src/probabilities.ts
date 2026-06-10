import { readVars } from "./data.ts";

// Function assigns initial probabilities to each map and sets the since_last_played attribute to default 30.
export function assignProbabilities(probs: any[]) {
    probs.forEach((element) => {
        element.prob = 1.0;
        element.since_last_played = 30;
    });

    return probs;
}

// Function calculates the cumulative prob value for each map
export function assignCumProbs(probs: any[]){
    let cum = 0.0;
    probs.forEach(element => {
        cum += element["prob"];
        element["cumulative_probs"] = cum;
    });
    return probs;
}

// Function calulates the relative probabilities for each map using the vars data
export function calcProbabilities(probs: any[], cooldown: number, probType:string){
    probs.forEach(element => {
        if (element["since_last_played"] < cooldown){
            element["prob"] = 0.0;
        }else if(element["since_last_played"] < cooldown*2){
            // if linear rejoining
            if (probType == "linear"){
                element["prob"] = (element["since_last_played"]-cooldown+1)/(cooldown+1);
            }
            // if exponential rejoining
            else if (probType == "exponential"){
                element["prob"] = Math.pow(2, element["since_last_played"]-(cooldown*2));
            }
            else{
                console.error("Invalid value for probType argument");
            }
        }else{
            element["prob"] = 1.0;
        }
    });
    probs = assignCumProbs(probs);
}

// Function randomly chooses a map and updates the table accordingly
export async function choose(probs: any[]){
    
    // console.log("hello", probs)
    const max_prob = probs[probs.length-1]["cumulative_probs"];
    const n = Math.random()*max_prob;

    let index = 0;
    probs.forEach(async element => {
        if (n > element["cumulative_probs"]){
            index +=1;
        }
    });
    probs = await update_table(probs, index);
    return probs[index]["map_name"];
}

// Function updates the probs table after a map is chosen
async function update_table(probs: any[], index: number){
    probs.forEach(element => {
        if (element["since_last_played"] < 30){
            element["since_last_played"] +=1
        }
    });
    probs[index]["since_last_played"] = 0;

    const vars = await readVars();
    
    calcProbabilities(probs, Number(vars["cooldown"]), vars["probType"])
    return probs;
}
