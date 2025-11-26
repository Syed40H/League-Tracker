export interface LeaguePlayer {
  id: string;
  name: string;
  driverId: string;
}

export interface RaceResult {
  raceId: number;
  topTen: string[]; // Array of driver IDs in finishing order
  driverOfTheDay: string;
  fastestLap: string;
  mostOvertakes: string;
  cleanestDriver: string;
}

export interface DriverStanding {
  driverId: string;
  driverName: string;
  team: string;
  leaguePlayerName?: string;
  points: number;
  awards: {
    driverOfTheDay: number;
    fastestLap: number;
    mostOvertakes: number;
    cleanestDriver: number;
  };
}

export interface ConstructorStanding {
  team: string;
  points: number;
}
