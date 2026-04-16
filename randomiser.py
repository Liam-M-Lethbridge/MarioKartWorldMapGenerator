import pandas as pd
import numpy as np
import os

class RandomMapPicker():
    def __init__(self, cooldown_count:int=6, soft_int:int=10, permanent:int=True, reset_modifier_type:str="exponential", history_saved:int = 30):
        """Args:
            cooldown_count: the number of races to play before this race is possible again.
            soft_int: the number of races it takes for the prob_value to return to normal after the cooldown count.
            permanent: when True, histroy is loaded.
            reset_modifier_type: either 'exponential' or 'linear'. Denotes the trend the prob_value takes to return to normal.
            history_saved: the number of races saved in history.
        """
        self.cooldown_count = cooldown_count
        self.soft_int = soft_int
        self.prob_value_increment = 1/self.soft_int
        self.reset_modifier_type = reset_modifier_type
        self.history_saved = history_saved
        self.get_maps()
        self.total = len(self.maps)
        assert(reset_modifier_type == "exponential" or reset_modifier_type == "linear")
        self.permanent = permanent
        if permanent:
            self.retrieve_history()

    def calc_probs(self):
        """This method will calculate probability values for each course according to the reset modifier type."""
        if self.reset_modifier_type == "linear":
            self.maps.loc[self.maps["soft_counter"] > 0, "prob_value"]=self.maps.loc[self.maps["soft_counter"] > 0, "soft_counter"]/self.soft_int 
        elif self.reset_modifier_type == "exponential":
            self.maps.loc[self.maps["soft_counter"] > 0, "prob_value"]=2**-self.maps.loc[self.maps["soft_counter"] > 0, "soft_counter"] 
            # self.maps["prob_value"]=2**(-self.maps["soft_counter"])
        self.maps.loc[(self.maps["soft_counter"] == 0) & (self.maps["cooldown_counter"] == 0), "prob_value"] = 1.0


    def get_maps(self):
        """This method gets the maps and applies a uniform distribution weighting to them."""
        maps = pd.read_csv("maps.csv")
        self.maps = pd.concat([maps, pd.DataFrame(np.ones(len(maps)), columns=["prob_value"]), pd.DataFrame(np.zeros(len(maps)), columns=["cooldown_counter"]), pd.DataFrame(np.zeros(len(maps)), columns=["soft_counter"])], axis = 1)
        self.calc_probs()
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
        self.maps.loc[index, "cooldown_counter"] = self.cooldown_count+1

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
        """This method updates the soft_counter and cooldown_counter for each relevant entry."""
        # For when we need to set the soft_counter
        self.maps.loc[self.maps["cooldown_counter"] == 1, "soft_counter"] = self.soft_int+1
        self.maps.loc[self.maps["cooldown_counter"] > 0, "cooldown_counter"] -= 1
        self.maps.loc[self.maps["soft_counter"] > 0, "soft_counter"] -= 1

        self.calc_probs()
        self.calc_cum_sum()

    def precompute_game(self, n_races: int = 6):
        for i in range(n_races):
            print(self.choose_map())

    def save_to_csv(self, path = "history.csv"):
        self.history = self.history.iloc[-self.history_saved:]
        self.history.to_csv(path, index=False)

    def retrieve_history(self, path = "history.csv"):
        if os.path.exists(path):
            try:
                self.history = pd.read_csv(path)
            except pd.errors.EmptyDataError:
                self.history = pd.DataFrame(columns=["index", "map_name"])
                return
        else:
            self.history = pd.DataFrame(columns=["index", "map_name"])
            return
        take = self.cooldown_count+self.soft_int
        if take<len(self.history):
            taken = self.history.iloc[-take:]
        else:
            taken = self.history
        
        for i in range(min(self.soft_int, max(len(taken)-self.cooldown_count,0))):
            self.maps.loc[self.maps["index"] == int(taken.iloc[-(i+self.cooldown_count+1)]["index"]), "soft_counter"] = self.soft_int-i

        # set the last cooldown_count maps to 0
        for i in range(min(self.cooldown_count, len(taken))):
            self.maps.loc[self.maps["index"] == int(taken.iloc[-(i+1)]["index"]), "cooldown_counter"] = self.cooldown_count-i
            self.maps.loc[self.maps["index"] == int(taken.iloc[-(i+1)]["index"]), "soft_counter"] = 0
            self.maps.loc[self.maps["index"] == int(taken.iloc[-(i+1)]["index"]), "prob_value"] = 0

        # self.maps.loc[self.maps["index"] == int(taken.iloc[-(1+self.cooldown_count)]["index"]), "prob_value"] = 0
        
        # set the rest of the maps to relevant soft_prob
        self.calc_probs()
        self.calc_cum_sum()
        
def test_retrieve_hist():
    rmp = RandomMapPicker(5,5, False)
    rmp.retrieve_history("test.csv")
    assert((rmp.maps.loc[rmp.maps["index"] < 5, "prob_value"] <1 ).all())
    assert((rmp.maps.loc[rmp.maps["index"] >= 5].loc[rmp.maps["index"] < 10, "prob_value"] == 0).all())

if __name__ == "__main__":
    rmp = RandomMapPicker(6,12)
    # print(rmp.maps)
    rmp.precompute_game(6)
    # test_retrieve_hist()