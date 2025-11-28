import { LeaguePlayer, RaceResult } from "@/types/league";

const STORAGE_KEYS = {
  LEAGUE_PLAYERS: "f1_league_players",
  RACE_RESULTS: "f1_race_results",
};

export const storage = {
  // Get all league players from localStorage
  getLeaguePlayers(): LeaguePlayer[] {
    const data = localStorage.getItem(STORAGE_KEYS.LEAGUE_PLAYERS);
    return data ? JSON.parse(data) : [];
  },

  // Save league players to localStorage
  setLeaguePlayers(players: LeaguePlayer[]): void {
    localStorage.setItem(STORAGE_KEYS.LEAGUE_PLAYERS, JSON.stringify(players));
  },

  // Get all race results from localStorage
  getRaceResults(): RaceResult[] {
    const data = localStorage.getItem(STORAGE_KEYS.RACE_RESULTS);
    return data ? JSON.parse(data) : [];
  },

  // Save race results to localStorage
  setRaceResults(results: RaceResult[]): void {
    localStorage.setItem(STORAGE_KEYS.RACE_RESULTS, JSON.stringify(results));
  },

  // Get a specific race result by raceId
  getRaceResult(raceId: number): RaceResult | undefined {
    const results = this.getRaceResults();
    return results.find(r => r.raceId === raceId);
  },

  // Save or update a specific race result
  saveRaceResult(result: RaceResult): void {
    const results = this.getRaceResults();
    const index = results.findIndex(r => r.raceId === result.raceId);
    
    if (index >= 0) {
      results[index] = result; // Update the existing result
    } else {
      results.push(result); // Add a new result
    }
    
    this.setRaceResults(results); // Save updated results back to localStorage
  },

  // Delete a specific race result by raceId
  deleteRaceResult(raceId: number): void {
    const results = this.getRaceResults();
    const updatedResults = results.filter(r => r.raceId !== raceId);
    this.setRaceResults(updatedResults); // Save updated results back to localStorage
  },

  // Reset the entire list of league players (for admin reset)
  resetLeaguePlayers(): void {
    localStorage.removeItem(STORAGE_KEYS.LEAGUE_PLAYERS);
  },

  // Reset the entire list of race results (for admin reset)
  resetRaceResults(): void {
    localStorage.removeItem(STORAGE_KEYS.RACE_RESULTS);
  },
};
