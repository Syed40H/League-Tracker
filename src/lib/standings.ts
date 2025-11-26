import { drivers } from "@/data/drivers";
import type {
  RaceResult,
  DriverStanding,
  ConstructorStanding,
  LeaguePlayer,
} from "@/types/league";

const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

/**
 * Calculate driver standings from Supabase-fed raceResults
 */
export function calculateDriverStandings(
  raceResults: RaceResult[],
  leaguePlayers: LeaguePlayer[] = []
): DriverStanding[] {
  const standingsMap = new Map<string, DriverStanding>();

  // Initialize all drivers
  drivers.forEach((driver) => {
    const assignedPlayer = leaguePlayers.find(
      (p) => p.driverId === driver.id
    );

    standingsMap.set(driver.id, {
      driverId: driver.id,
      driverName: driver.name,
      team: driver.team,
      leaguePlayerName: assignedPlayer?.name ?? null,
      points: 0,
      awards: {
        driverOfTheDay: 0,
        fastestLap: 0,
        mostOvertakes: 0,
        cleanestDriver: 0,
      },
    });
  });

  // Apply all race results
  for (const result of raceResults) {
    // Points for top 10
    result.topTen.forEach((driverId, index) => {
      if (!driverId) return;
      const standing = standingsMap.get(driverId);
      if (standing && index < POINTS_SYSTEM.length) {
        standing.points += POINTS_SYSTEM[index];
      }
    });

    // Awards
    const awards = [
      { id: result.driverOfTheDay, key: "driverOfTheDay" as const },
      { id: result.fastestLap, key: "fastestLap" as const },
      { id: result.mostOvertakes, key: "mostOvertakes" as const },
      { id: result.cleanestDriver, key: "cleanestDriver" as const },
    ];

    awards.forEach(({ id, key }) => {
      if (!id) return;
      const standing = standingsMap.get(id);
      if (standing) {
        standing.awards[key]++;
      }
    });
  }

  // Return sorted list
  return Array.from(standingsMap.values()).sort(
    (a, b) => b.points - a.points
  );
}

/**
 * Calculate constructor standings
 */
export function calculateConstructorStandings(
  raceResults: RaceResult[],
  leaguePlayers: LeaguePlayer[] = []
): ConstructorStanding[] {
  const driverStandings = calculateDriverStandings(
    raceResults,
    leaguePlayers
  );

  const map = new Map<string, number>();

  driverStandings.forEach((standing) => {
    map.set(
      standing.team,
      (map.get(standing.team) || 0) + standing.points
    );
  });

  return Array.from(map.entries())
    .map(([team, points]) => ({ team, points }))
    .sort((a, b) => b.points - a.points);
}
