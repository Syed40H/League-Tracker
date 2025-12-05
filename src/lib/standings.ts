import { drivers } from "@/data/drivers";
import type {
  DriverStanding,
  ConstructorStanding,
  RaceResult,
  LeaguePlayer,
} from "@/types/league";

const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

// 🔹 Team overrides passed in from the app (Supabase-backed)
export type TeamOverrideMap = Record<
  string,
  {
    team: string;
    teamColor?: string;
  }
>;

export function calculateDriverStandings(
  raceResults: RaceResult[],
  leaguePlayers: LeaguePlayer[] = [],
  teamOverrides: TeamOverrideMap = {}
): DriverStanding[] {
  const standingsMap = new Map<string, DriverStanding>();

  // Quick lookup: driverId -> league player
  const leagueByDriver = new Map<string, LeaguePlayer>();
  leaguePlayers.forEach((p) => {
    if (p?.driverId) {
      leagueByDriver.set(p.driverId, p);
    }
  });

  // Initialize all drivers
  drivers.forEach((driver) => {
    const leaguePlayer = leagueByDriver.get(driver.id);

    // ✅ If there's an override, use that team instead of default
    const override = teamOverrides[driver.id];
    const effectiveTeam = override?.team ?? driver.team;

    standingsMap.set(driver.id, {
      driverId: driver.id,
      driverName: driver.name,
      team: effectiveTeam,
      leaguePlayerName: leaguePlayer?.name,
      points: 0,
      awards: {
        driverOfTheDay: 0,
        fastestLap: 0,
        mostOvertakes: 0,
        cleanestDriver: 0,
      },
    });
  });

  // Aggregate every race
  raceResults.forEach((result) => {
    if (!result || !Array.isArray(result.topTen)) return;

    // Top 10 points
    result.topTen.forEach((driverId, index) => {
      if (!driverId) return;
      if (index >= POINTS_SYSTEM.length) return;

      const standing = standingsMap.get(driverId);
      if (!standing) return;

      standing.points += POINTS_SYSTEM[index];
    });

    // Awards
    const awards = [
      { driverId: result.driverOfTheDay, key: "driverOfTheDay" as const },
      { driverId: result.fastestLap, key: "fastestLap" as const },
      { driverId: result.mostOvertakes, key: "mostOvertakes" as const },
      { driverId: result.cleanestDriver, key: "cleanestDriver" as const },
    ];

    awards.forEach(({ driverId, key }) => {
      if (!driverId) return;
      const standing = standingsMap.get(driverId);
      if (!standing) return;
      standing.awards[key] += 1;
    });
  });

  return Array.from(standingsMap.values()).sort(
    (a, b) => b.points - a.points
  );
}

export function calculateConstructorStandings(
  raceResults: RaceResult[],
  leaguePlayers: LeaguePlayer[] = [],
  teamOverrides: TeamOverrideMap = {}
): ConstructorStanding[] {
  // ✅ Uses the possibly overridden team from DriverStanding
  const driverStandings = calculateDriverStandings(
    raceResults,
    leaguePlayers,
    teamOverrides
  );

  const constructorMap = new Map<string, number>();

  driverStandings.forEach((standing) => {
    const current = constructorMap.get(standing.team) ?? 0;
    constructorMap.set(standing.team, current + standing.points);
  });

  return Array.from(constructorMap.entries())
    .map(([team, points]) => ({ team, points }))
    .sort((a, b) => b.points - a.points);
}
