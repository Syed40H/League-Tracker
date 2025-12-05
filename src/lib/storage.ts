import { LeaguePlayer, RaceResult } from "@/types/league";

const STORAGE_KEYS = {
  LEAGUE_PLAYERS: "f1_league_players",
  RACE_RESULTS: "f1_race_results",
  DRIVER_TEAM_OVERRIDES: "f1_driver_team_overrides", // ⭐ NEW
};

// Type for a single driver's team override
type DriverTeamOverride = {
  team: string;
  teamColor: string;
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
    return results.find((r) => r.raceId === raceId);
  },

  // Save or update a specific race result
  saveRaceResult(result: RaceResult): void {
    const results = this.getRaceResults();
    const index = results.findIndex((r) => r.raceId === result.raceId);

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
    const updatedResults = results.filter((r) => r.raceId !== raceId);
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

  // ⭐⭐⭐ DRIVER TEAM OVERRIDES ⭐⭐⭐

  // Get all driver team overrides (driverId -> { team, teamColor })
  getDriverTeamOverrides(): Record<string, DriverTeamOverride> {
    const data = localStorage.getItem(STORAGE_KEYS.DRIVER_TEAM_OVERRIDES);
    return data ? JSON.parse(data) : {};
  },

  // Overwrite all overrides
  setDriverTeamOverrides(overrides: Record<string, DriverTeamOverride>): void {
    localStorage.setItem(
      STORAGE_KEYS.DRIVER_TEAM_OVERRIDES,
      JSON.stringify(overrides)
    );
  },

  // Save or update a single driver's team override
  saveDriverTeamOverride(
    driverId: string,
    team: string,
    teamColor: string
  ): void {
    const overrides = this.getDriverTeamOverrides();
    overrides[driverId] = { team, teamColor };
    this.setDriverTeamOverrides(overrides);
  },

  // Clear a single driver's override (go back to default team)
  clearDriverTeamOverride(driverId: string): void {
    const overrides = this.getDriverTeamOverrides();
    if (overrides[driverId]) {
      delete overrides[driverId];
      this.setDriverTeamOverrides(overrides);
    }
  },

  // Reset all driver team overrides
  resetDriverTeamOverrides(): void {
    localStorage.removeItem(STORAGE_KEYS.DRIVER_TEAM_OVERRIDES);
  },
};
