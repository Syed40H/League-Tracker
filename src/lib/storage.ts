import { LeaguePlayer, RaceResult } from "@/types/league";

const STORAGE_KEYS = {
  LEAGUE_PLAYERS: "f1_league_players",
  RACE_RESULTS: "f1_race_results",
};

export const storage = {
  getLeaguePlayers(): LeaguePlayer[] {
    const data = localStorage.getItem(STORAGE_KEYS.LEAGUE_PLAYERS);
    return data ? JSON.parse(data) : [];
  },

  setLeaguePlayers(players: LeaguePlayer[]): void {
    localStorage.setItem(STORAGE_KEYS.LEAGUE_PLAYERS, JSON.stringify(players));
  },

  getRaceResults(): RaceResult[] {
    const data = localStorage.getItem(STORAGE_KEYS.RACE_RESULTS);
    return data ? JSON.parse(data) : [];
  },

  setRaceResults(results: RaceResult[]): void {
    localStorage.setItem(STORAGE_KEYS.RACE_RESULTS, JSON.stringify(results));
  },

  getRaceResult(raceId: number): RaceResult | undefined {
    const results = this.getRaceResults();
    return results.find(r => r.raceId === raceId);
  },

  saveRaceResult(result: RaceResult): void {
    const results = this.getRaceResults();
    const index = results.findIndex(r => r.raceId === result.raceId);
    
    if (index >= 0) {
      results[index] = result;
    } else {
      results.push(result);
    }
    
    this.setRaceResults(results);
  },
};
