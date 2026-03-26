import pandas as pd
import numpy as np
import os

class RandomMapPicker():
    def __init__(self, cooldown_count = 6, soft_int = 10, permanent = True):
        self.cooldown_count = cooldown_count
        self.soft_int = soft_int
        self.prob_value_increment = 1/soft_int
        self.get_maps()
        self.total = len(self.maps)

        self.permanent = permanent
        if permanent:
            self.retrieve_history()

    def get_maps(self):
        """This method gets the maps and applies a uniform distribution weighting to them."""
        maps = pd.read_csv("maps.csv")
        self.maps = pd.concat([maps, pd.DataFrame(np.ones(len(maps)), columns=["prob_value"]), pd.DataFrame(np.zeros(len(maps)), columns=["cooldown_counter"])], axis = 1)
        self.calc_cum_sum()

    def choose_map(self):
        """This method chooses a map and updates the probabilities of each map accordingly."""
        largest_value = self.maps["cumulative_prob_values"].iloc[-1]
        prob_val = np.random.uniform(0, largest_value)
        if prob_val < self.maps.iloc[0]["cumulative_prob_values"]:
            index = 0
        else:
            # iterate through list until we find the first case where the prob value is lower
            # the chosen entry is the index after that
            index = self.maps["cumulative_prob_values"].searchsorted(prob_val)

        
        # set the prob_value and cooldown_counter
        self.maps.loc[index, "prob_value"] = 0
        self.maps.loc[index, "cooldown_counter"] = self.cooldown_count

        # update all necessary entries
        self.update_table()
        if self.permanent:
            entry = self.maps.loc[self.maps["index"] == index]
            self.history = pd.concat([self.history, entry[["index", "map_name"]]], axis = 0)
            self.save_to_csv()

        return self.maps["map_name"][index]
    
    def calc_cum_sum(self):
        """This method calculates the cumulative probability values."""
        self.maps["cumulative_prob_values"] = self.maps["prob_value"].cumsum()

    def update_table(self):
        """This method updates the prob_value and cooldown_counter for each relevant entry."""
        self.maps.loc[self.maps["cooldown_counter"] == 0, "prob_value"] += self.prob_value_increment
        self.maps["prob_value"] = np.min([self.maps["prob_value"], np.ones_like(self.maps["prob_value"])], axis = 0)
        self.maps.loc[self.maps["cooldown_counter"] > 0, "cooldown_counter"] -= 1
        self.calc_cum_sum()

    def precompute_game(self, n_races: int = 6):
        for i in range(n_races):
            print(self.choose_map())

    def save_to_csv(self):
        self.history.to_csv("history.csv", index=False)

    def retrieve_history(self):
        if os.path.exists("history.csv"):
            self.history = pd.read_csv("history.csv")
        else:
            self.history = pd.DataFrame(columns=["maps"])
        take = self.cooldown_count-1+self.soft_int
        if take<len(self.history):
            taken = self.history.iloc[-take:]
        else:
            taken = self.history
        
        # set the last cooldown_count maps to 0
        for i in range(min(self.cooldown_count-1, len(taken))):
            self.maps.loc[self.maps["index"] == int(taken.iloc[-(1+i)]["index"]), "cooldown_counter"] = self.cooldown_count-i-1
            self.maps.loc[self.maps["index"] == int(taken.iloc[-(1+i)]["index"]), "prob_value"] = 0
        # set the rest of the maps to relevant soft_prob
        for i in range(min(self.soft_int, max(len(taken)-self.cooldown_count+1,0))):
            self.maps.loc[self.maps["index"] == int(taken.iloc[-(i+self.cooldown_count)]["index"]), "prob_value"] = (i+1)*self.prob_value_increment
        
        self.calc_cum_sum()
        

if __name__ == "__main__":
    rmp = RandomMapPicker(12,12)
    print(rmp.maps)
    rmp.precompute_game(12)